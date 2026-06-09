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
import type { PublishEnvConfig } from "./config.js";
import { createPublisherFromEnv } from "./publisherRuntime.js";
import { safePostPath } from "./postPaths.js";

export type PublishRequestBody = ArticleInput & {
  sourcePath?: unknown;
};

export type PublishSuccessResponse = {
  ok: true;
  path: string;
  created: boolean;
  sha: string;
  commitSha: string;
};

export type PublishErrorResponse = {
  ok: false;
  error: string;
  issues?: { field: string; message: string }[];
  status?: number;
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

  const publisher = createPublisherFromEnv(env);

  const result = await publisher.publishArticle({
    path,
    content,
    message: `Publish: ${article.slug}`,
  });

  if (!result.ok) {
    const errorBody: PublishErrorResponse = {
      ok: false,
      error: result.error || "Publish to GitHub failed.",
    };

    if (result.status !== undefined) {
      errorBody.status = result.status;
    }

    return {
      status: 502,
      body: errorBody,
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
    },
  };
}
