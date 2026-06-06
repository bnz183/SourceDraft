import { getAstroMdxPath, toAstroMdx } from "@sourcedraft/adapter-astro-mdx";
import {
  normalizeArticle,
  validateArticle,
  type ArticleInput,
} from "@sourcedraft/core";
import { createGitHubPublisher } from "@sourcedraft/github-publisher";
import type { PublishEnvConfig } from "./config.js";

export type PublishRequestBody = ArticleInput;

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
  const mdx = toAstroMdx(article);
  const path = getAstroMdxPath(article, { contentDir: env.contentDir });

  const publisher = createGitHubPublisher({
    token: env.token,
    owner: env.owner,
    repo: env.repo,
    branch: env.branch,
  });

  const result = await publisher.publishFile({
    path,
    content: mdx,
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
