import {
  getAdapterPostPath,
  renderAdapterOutput,
} from "@sourcedraft/adapters";
import {
  normalizeArticle,
  validateArticle,
  type Article,
  type ArticleInput,
} from "@sourcedraft/core";
import {
  isPrPublishMode,
  parsePublishMode,
  publishModeSummary,
  type CmsArticlePayload,
  type PublishMode,
} from "@sourcedraft/publishers";
import type { PublishEnvConfig } from "./config.js";
import {
  applyDeployHookStrictMode,
  loadDeployHookConfigFromEnv,
  triggerDeployHook,
  type DeployHookResult,
} from "./deployHook.js";
import { createPublisherFromEnv } from "./publisherRuntime.js";
import { safePostPath } from "./postPaths.js";

export type PublishRequestBody = ArticleInput & {
  sourcePath?: unknown;
  /** Remote CMS post id (WordPress post id, Ghost uuid) for updates */
  remoteId?: unknown;
  publishMode?: unknown;
};

export type PublishSuccessResponse = {
  ok: true;
  path: string;
  created: boolean;
  sha: string;
  commitSha: string;
  remoteId?: string;
  publishMode?: PublishMode;
  prUrl?: string;
  prNumber?: number;
  prBranch?: string;
  baseBranch?: string;
  deployHook?: DeployHookResult;
  deployHookNote?: string;
};

export type PublishErrorResponse = {
  ok: false;
  error: string;
  issues?: { field: string; message: string }[];
  status?: number;
  deployHook?: DeployHookResult;
};

export type PublishResponse = PublishSuccessResponse | PublishErrorResponse;

function renderArticle(article: Article, env: PublishEnvConfig): string {
  return renderAdapterOutput(env.adapter, article, env.adapterOptions);
}

function defaultPostPath(article: Article, env: PublishEnvConfig): string {
  return getAdapterPostPath(env.adapter, article, {
    contentDir: env.contentDir,
    ...(env.adapterOptions !== undefined
      ? { adapterOptions: env.adapterOptions }
      : {}),
  });
}

function toCmsPayload(article: Article): CmsArticlePayload {
  return {
    title: article.title,
    slug: article.slug,
    description: article.description,
    body: article.body,
    pubDate: article.pubDate,
    category: article.category,
    tags: article.tags,
    draft: article.draft,
    ...(article.updatedDate !== undefined ? { updatedDate: article.updatedDate } : {}),
    ...(article.heroImage !== undefined ? { heroImage: article.heroImage } : {}),
    ...(article.author !== undefined ? { author: article.author } : {}),
    ...(article.metaTitle !== undefined ? { metaTitle: article.metaTitle } : {}),
    ...(article.metaDescription !== undefined
      ? { metaDescription: article.metaDescription }
      : {}),
    ...(article.canonicalUrl !== undefined ? { canonicalUrl: article.canonicalUrl } : {}),
    ...(article.socialImage !== undefined ? { socialImage: article.socialImage } : {}),
    ...(article.coverImageAlt !== undefined ? { coverImageAlt: article.coverImageAlt } : {}),
    ...(article.noindex === true ? { noindex: true } : {}),
  };
}

function resolvePublishMode(
  body: PublishRequestBody,
  env: PublishEnvConfig,
): { ok: true; mode: PublishMode } | { ok: false; error: string } {
  if (body.publishMode !== undefined) {
    const parsed = parsePublishMode(body.publishMode);
    if (parsed === null) {
      return {
        ok: false,
        error: `Unsupported publish mode. Supported modes: ${publishModeSummary()}.`,
      };
    }

    return { ok: true, mode: parsed };
  }

  return { ok: true, mode: env.publishMode };
}

function parseRemoteId(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

export async function publishArticle(
  body: PublishRequestBody,
  env: PublishEnvConfig,
): Promise<{ status: number; body: PublishResponse }> {
  const validation = validateArticle(body);
  if (!validation.valid) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Article validation failed.",
        issues: validation.issues,
      },
    };
  }

  const article = normalizeArticle(body);
  let path: string;

  if (typeof body.sourcePath === "string" && body.sourcePath.trim().length > 0) {
    const safe = safePostPath(body.sourcePath.trim(), env.contentDir);
    if (!safe.ok) {
      return {
        status: 400,
        body: {
          ok: false,
          error: safe.error,
        },
      };
    }

    path = safe.path;
  } else {
    path = defaultPostPath(article, env);
  }

  const publishModeResult = resolvePublishMode(body, env);
  if (!publishModeResult.ok) {
    return {
      status: 400,
      body: {
        ok: false,
        error: publishModeResult.error,
      },
    };
  }

  const publishMode = publishModeResult.mode;
  if (isPrPublishMode(publishMode) && env.publisher !== "github") {
    return {
      status: 400,
      body: {
        ok: false,
        error: `Pull request publish mode is only supported for the GitHub publisher. Current publisher: ${env.publisher}.`,
      },
    };
  }

  const content = renderArticle(article, env);
  const remoteId = parseRemoteId(body.remoteId);
  const publisher = createPublisherFromEnv(env);

  const result = await publisher.publishArticle({
    path,
    content,
    message: `Publish: ${article.slug}`,
    article: toCmsPayload(article),
    slug: article.slug,
    publishMode,
    prBranchPrefix: env.prBranchPrefix,
    ...(remoteId !== undefined ? { remoteId } : {}),
  });

  if (!result.ok) {
    const errorBody: PublishErrorResponse = {
      ok: false,
      error: result.error || "Publish failed.",
    };

    if (result.status !== undefined) {
      errorBody.status = result.status;
    }

    return {
      status: 502,
      body: errorBody,
    };
  }

  if (isPrPublishMode(publishMode)) {
    return {
      status: 200,
      body: {
        ok: true,
        path: result.path,
        created: result.created,
        sha: result.sha,
        commitSha: result.commitSha,
        publishMode,
        ...(result.prUrl !== undefined ? { prUrl: result.prUrl } : {}),
        ...(result.prNumber !== undefined ? { prNumber: result.prNumber } : {}),
        ...(result.prBranch !== undefined ? { prBranch: result.prBranch } : {}),
        ...(result.baseBranch !== undefined ? { baseBranch: result.baseBranch } : {}),
        deployHookNote:
          "PR created; deploy hook not triggered until merge.",
      },
    };
  }

  const deployHookConfig = loadDeployHookConfigFromEnv();
  const deployHook = await triggerDeployHook(result.path, deployHookConfig);
  const strictGate = applyDeployHookStrictMode(
    true,
    deployHook,
    deployHookConfig.strict === true,
  );

  if (!strictGate.ok) {
    return {
      status: 502,
      body: {
        ok: false,
        error: strictGate.error ?? "Deploy hook failed in strict mode.",
        deployHook,
      },
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      path: result.path,
      created: result.created,
      sha: result.sha,
      commitSha: result.commitSha,
      publishMode: result.publishMode ?? "direct",
      ...(result.remoteId !== undefined ? { remoteId: result.remoteId } : {}),
      ...(deployHook.triggered ? { deployHook } : {}),
    },
  };
}
