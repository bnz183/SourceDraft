import {
  getAdapterPostPath,
  renderAdapterOutput,
} from "@sourcedraft/adapters";
import {
  normalizeArticle,
  validateArticle,
  type Article,
} from "@sourcedraft/core";
import type { PublishEnvConfig } from "./config.js";
import { summaryFromArticle } from "./demoPosts.js";
import { demoCommitSha, upsertDemoPost } from "./demoStore.js";
import { safePostPath } from "./postPaths.js";
import type { PublishRequestBody, PublishResponse } from "./publish.js";

function renderArticle(article: Article, env: Omit<PublishEnvConfig, "token">): string {
  return renderAdapterOutput(env.adapter, article, env.adapterOptions);
}

function defaultPostPath(
  article: Article,
  env: Omit<PublishEnvConfig, "token">,
): string {
  return getAdapterPostPath(env.adapter, article, {
    contentDir: env.contentDir,
    ...(env.adapterOptions !== undefined
      ? { adapterOptions: env.adapterOptions }
      : {}),
  });
}

export async function publishDemoArticle(
  body: PublishRequestBody,
  env: Omit<PublishEnvConfig, "token">,
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
  let created = false;

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
    created = true;
  }

  const content = renderArticle(article, env);
  const commitSha = demoCommitSha();

  upsertDemoPost(path, content, {
    path,
    ...summaryFromArticle(path, article),
  });

  return {
    status: 200,
    body: {
      ok: true,
      path,
      created,
      sha: commitSha,
      commitSha,
    },
  };
}
