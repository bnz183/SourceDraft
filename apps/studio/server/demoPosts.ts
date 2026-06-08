import {
  validateArticle,
  type ArticleInput,
} from "@sourcedraft/core";
import type { PublishEnvConfig } from "./config.js";
import { getDemoPost, listDemoPosts } from "./demoStore.js";
import {
  frontmatterToArticleInput,
  splitFrontmatter,
  slugFromPath,
  type PostLoadResponse,
  type PostsListResponse,
} from "./posts.js";
import { safePostPath } from "./postPaths.js";

export async function listDemoPostsHandler(): Promise<{
  status: number;
  body: PostsListResponse;
}> {
  return {
    status: 200,
    body: { ok: true, posts: listDemoPosts() },
  };
}

export async function loadDemoPost(
  path: string,
  env: Omit<PublishEnvConfig, "token">,
): Promise<{ status: number; body: PostLoadResponse }> {
  const safe = safePostPath(path, env.contentDir);
  if (!safe.ok) {
    return {
      status: 400,
      body: { ok: false, error: safe.error },
    };
  }

  const stored = getDemoPost(safe.path);
  if (stored === null) {
    return {
      status: 404,
      body: { ok: false, error: "Post not found in demo content." },
    };
  }

  const parsed = splitFrontmatter(stored.content);
  if (parsed === null) {
    return {
      status: 400,
      body: { ok: false, error: "Post frontmatter is missing or invalid." },
    };
  }

  const article = frontmatterToArticleInput(
    safe.path,
    parsed.frontmatter,
    parsed.body,
  );
  const validation = validateArticle(article);
  if (!validation.valid) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Loaded post failed validation.",
        issues: validation.issues,
      },
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      path: safe.path,
      article: {
        ...article,
        sourcePath: safe.path,
      },
    },
  };
}

export function summaryFromArticle(
  path: string,
  article: ArticleInput,
): {
  title: string;
  slug: string;
  pubDate: string;
  category: string;
  draft: boolean;
} {
  return {
    title: typeof article.title === "string" ? article.title : slugFromPath(path),
    slug: typeof article.slug === "string" ? article.slug : slugFromPath(path),
    pubDate: typeof article.pubDate === "string" ? article.pubDate : "",
    category: typeof article.category === "string" ? article.category : "",
    draft: article.draft === true,
  };
}
