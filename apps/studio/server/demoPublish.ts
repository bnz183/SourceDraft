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
import {
  isPrPublishMode,
  parsePublishMode,
  publishModeSummary,
  type PublishMode,
} from "@sourcedraft/publishers";
import type { PublishRequestBody, PublishResponse } from "./publish.js";

function isAllowedBranchChar(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 97 && code <= 122) ||
    (code >= 48 && code <= 57) ||
    char === "." ||
    char === "_" ||
    char === "/" ||
    char === "-"
  );
}

function isTrimChar(char: string | undefined): boolean {
  return char === "-" || char === "." || char === "/";
}

function sanitizeBranchSegment(value: string): string {
  const chars: string[] = [];

  for (const char of value.trim().toLowerCase()) {
    if (isAllowedBranchChar(char)) {
      if (char === "-") {
        if (chars[chars.length - 1] !== "-") {
          chars.push(char);
        }
      } else {
        chars.push(char);
      }
      continue;
    }

    if (chars.length > 0 && chars[chars.length - 1] !== "-") {
      chars.push("-");
    }
  }

  while (isTrimChar(chars[0])) {
    chars.shift();
  }

  while (chars.length > 0 && isTrimChar(chars[chars.length - 1])) {
    chars.pop();
  }

  return chars.length > 0 ? chars.join("") : "post";
}

function demoPrBranch(slug: string, prefix: string): string {
  const safePrefix = prefix.endsWith("/") ? prefix : `${prefix}/`;
  return `${safePrefix}${sanitizeBranchSegment(slug)}`;
}

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

function resolveDemoPublishMode(
  body: PublishRequestBody,
  env: Omit<PublishEnvConfig, "token">,
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

  const publishModeResult = resolveDemoPublishMode(body, env);
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
  const commitSha = demoCommitSha();

  if (isPrPublishMode(publishMode)) {
    const prBranch = demoPrBranch(article.slug, env.prBranchPrefix);
    const prNumber = 101;
    const owner = env.owner || "demo";
    const repo = env.repo || "sample-posts";

    return {
      status: 200,
      body: {
        ok: true,
        path,
        created,
        sha: commitSha,
        commitSha,
        publishMode,
        prBranch,
        baseBranch: env.branch,
        prNumber,
        prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
        deployHookNote:
          "PR created; deploy hook not triggered until merge.",
      },
    };
  }

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
      publishMode: "direct",
    },
  };
}
