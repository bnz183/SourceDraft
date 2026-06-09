import { slugFromFilename } from "@sourcedraft/adapter-eleventy-jekyll-markdown";
import {
  frontmatterToArticleInput as adapterFrontmatterToArticleInput,
} from "@sourcedraft/adapters";
import {
  validateArticle,
  type ArticleInput,
} from "@sourcedraft/core";
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

function parseScalar(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed
      .slice(1, -1)
      .replace(/\\"/gu, '"')
      .replace(/\\n/gu, "\n")
      .replace(/\\r/gu, "\r")
      .replace(/\\t/gu, "\t");
  }

  return trimmed;
}

function parseYamlValue(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "";
  }

  if (trimmed === "true") {
    return true;
  }

  if (trimmed === "false") {
    return false;
  }

  if (trimmed === "null") {
    return null;
  }

  return parseScalar(trimmed);
}

function parseFrontmatter(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yaml.split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";

    if (line.trim().length === 0 || line.trimStart().startsWith("#")) {
      index += 1;
      continue;
    }

    if (/^tags:\s*\[\]\s*$/u.test(line)) {
      result.tags = [];
      index += 1;
      continue;
    }

    if (/^tags:\s*$/u.test(line)) {
      const tags: string[] = [];
      index += 1;

      while (index < lines.length && /^\s+-\s+/u.test(lines[index] ?? "")) {
        const tagLine = lines[index] ?? "";
        tags.push(parseScalar(tagLine.replace(/^\s+-\s+/u, "")));
        index += 1;
      }

      result.tags = tags;
      continue;
    }

    const match = line.match(/^([A-Za-z]+):\s*(.*)$/u);
    if (match) {
      const key = match[1];
      const value = match[2] ?? "";
      if (key !== undefined) {
        result[key] = parseYamlValue(value);
      }
      index += 1;
      continue;
    }

    index += 1;
  }

  return result;
}

export function splitFrontmatter(
  content: string,
): { frontmatter: Record<string, unknown>; body: string } | null {
  if (!content.startsWith("---\n")) {
    return null;
  }

  const closingIndex = content.indexOf("\n---\n", 4);
  if (closingIndex === -1) {
    return null;
  }

  const yaml = content.slice(4, closingIndex);
  const body = content.slice(closingIndex + 5);

  return {
    frontmatter: parseFrontmatter(yaml),
    body,
  };
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
