import { getAstroMdxPath, toAstroMdx } from "@sourcedraft/adapter-astro-mdx";
import { getMarkdownPath, toMarkdown } from "@sourcedraft/adapter-markdown";
import {
  normalizeArticle,
  validateArticle,
  type Article,
  type ArticleInput,
} from "@sourcedraft/core";
import { createGitHubPublisher } from "@sourcedraft/github-publisher";
import type { PublishEnvConfig } from "./config.js";
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

function renderArticle(article: Article, adapter: PublishEnvConfig["adapter"]): string {
  if (adapter === "markdown") {
    return toMarkdown(article);
  }

  return toAstroMdx(article);
}

function defaultPostPath(
  article: Article,
  adapter: PublishEnvConfig["adapter"],
  contentDir: string,
): string {
  if (adapter === "markdown") {
    return getMarkdownPath(article, { contentDir });
  }

  return getAstroMdxPath(article, { contentDir });
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
    path = defaultPostPath(article, env.adapter, env.contentDir);
  }

  const content = renderArticle(article, env.adapter);

  const publisher = createGitHubPublisher({
    token: env.token,
    owner: env.owner,
    repo: env.repo,
    branch: env.branch,
  });

  const result = await publisher.publishFile({
    path,
    content,
    message: `Publish: ${article.slug}`,
  });

  if (!result.ok) {
    const errorBody: PublishErrorResponse = {
      ok: false,
      error: result.error,
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
