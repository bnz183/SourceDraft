import { slugFromFilename } from "@sourcedraft/adapter-eleventy-jekyll-markdown";
import {
  frontmatterToArticleInput as adapterFrontmatterToArticleInput,
} from "@sourcedraft/adapters";
import {
  validateArticle,
  type ArticleInput,
} from "@sourcedraft/core";
import { splitFrontmatter as splitFrontmatterFromSetup } from "@sourcedraft/setup";
import type { PublishEnvConfig } from "./config.js";
import { createPublisherFromEnv } from "./publisherRuntime.js";
import { normalizeContentDir, safePostPath } from "./postPaths.js";

export type PostSummary = {
  path: string;
  title: string;
  slug: string;
  pubDate: string;
  category: string;
  draft: boolean;
};

export type PostsListResponse =
  | { ok: true; posts: PostSummary[] }
  | { ok: false; error: string };

export type PostLoadResponse =
  | { ok: true; path: string; article: ArticleInput & { sourcePath: string } }
  | { ok: false; error: string; issues?: { field: string; message: string }[] };

function createPublisher(env: PublishEnvConfig) {
  return createPublisherFromEnv(env);
}

export function slugFromPath(path: string): string {
  const filename = path.split("/").pop() ?? "";
  return slugFromFilename(filename);
}

export function splitFrontmatter(
  content: string,
): { frontmatter: Record<string, unknown>; body: string } | null {
  return splitFrontmatterFromSetup(content);
}

export function frontmatterToArticleInput(
  path: string,
  frontmatter: Record<string, unknown>,
  body: string,
  adapter: PublishEnvConfig["adapter"],
): ArticleInput {
  return adapterFrontmatterToArticleInput(adapter, path, frontmatter, body);
}

export async function listPosts(
  env: PublishEnvConfig,
): Promise<{ status: number; body: PostsListResponse }> {
  const publisher = createPublisher(env);
  const contentDir = normalizeContentDir(env.contentDir);
  const listed = await publisher.listPosts({ contentDir });

  if (!listed.ok) {
    return {
      status: listed.status === 404 ? 404 : 502,
      body: { ok: false, error: listed.error },
    };
  }

  const posts: PostSummary[] = [];

  for (const file of listed.files) {
    const safe = safePostPath(file.path, contentDir);
    if (!safe.ok) {
      continue;
    }

    const loaded = await publisher.readPost({ path: safe.path });
    if (!loaded.ok) {
      continue;
    }

    const parsed = splitFrontmatter(loaded.content);
    if (parsed === null) {
      continue;
    }

    const article = frontmatterToArticleInput(
      safe.path,
      parsed.frontmatter,
      parsed.body,
      env.adapter,
    );
    const validation = validateArticle(article);
    if (!validation.valid) {
      continue;
    }

    posts.push({
      path: safe.path,
      title: typeof article.title === "string" ? article.title : slugFromPath(safe.path),
      slug: typeof article.slug === "string" ? article.slug : slugFromPath(safe.path),
      pubDate: typeof article.pubDate === "string" ? article.pubDate : "",
      category: typeof article.category === "string" ? article.category : "",
      draft: article.draft === true,
    });
  }

  posts.sort((left, right) => right.pubDate.localeCompare(left.pubDate));

  return {
    status: 200,
    body: { ok: true, posts },
  };
}

export async function loadPost(
  path: string,
  env: PublishEnvConfig,
): Promise<{ status: number; body: PostLoadResponse }> {
  const safe = safePostPath(path, env.contentDir);
  if (!safe.ok) {
    return {
      status: 400,
      body: { ok: false, error: safe.error },
    };
  }

  const publisher = createPublisher(env);
  const loaded = await publisher.readPost({ path: safe.path });

  if (!loaded.ok) {
    const status = loaded.status === 404 ? 404 : 502;
    return {
      status,
      body: { ok: false, error: loaded.error },
    };
  }

  const parsed = splitFrontmatter(loaded.content);
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
    env.adapter,
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
