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
import type { CmsArticlePayload } from "@sourcedraft/publishers";
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
};

export type PublishSuccessResponse = {
  ok: true;
  path: string;
  created: boolean;
  sha: string;
  commitSha: string;
  remoteId?: string;
  deployHook?: DeployHookResult;
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

  const content = renderArticle(article, env);
  const remoteId = parseRemoteId(body.remoteId);
  const publisher = createPublisherFromEnv(env);

  const result = await publisher.publishArticle({
    path,
    content,
    message: `Publish: ${article.slug}`,
    article: toCmsPayload(article),
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
      ...(result.remoteId !== undefined ? { remoteId: result.remoteId } : {}),
      ...(deployHook.triggered ? { deployHook } : {}),
    },
  };
}
