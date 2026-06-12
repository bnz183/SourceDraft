import { join } from "node:path";
import {
  countMarkdownFiles,
  findMarkdownContentDirs,
  pathExists,
} from "./scanUtils.js";

const ADAPTER_CONTENT_CANDIDATES: Record<string, string[]> = {
  "astro-mdx": [
    "src/content/blog",
    "src/content/posts",
    "src/content/articles",
    "src/content",
    "content/blog",
    "content",
  ],
  "nextjs-mdx": ["content/posts", "content/blog", "content", "src/content"],
  "hugo-markdown": [
    "content/posts",
    "content/blog",
    "content/articles",
    "content",
  ],
  "eleventy-jekyll-markdown": ["src/posts", "_posts", "src/content", "posts"],
  markdown: ["content/posts", "content", "posts", "src/content"],
  "docusaurus-mdx": ["blog", "docs/blog"],
  "mkdocs-markdown": ["docs"],
  "nuxt-content-markdown": ["content", "content/blog", "content/articles"],
};

export type DetectedContentRoot = {
  contentDir: string;
  alternatives: string[];
  postCount: number;
};

export function detectContentRoot(
  root: string,
  adapter: string,
  fallbackContentDir: string,
): DetectedContentRoot {
  const candidates = new Set<string>([
    ...(ADAPTER_CONTENT_CANDIDATES[adapter] ?? []),
    fallbackContentDir,
  ]);

  const scored = [...candidates]
    .map((relativePath) => {
      const absolutePath = join(root, relativePath);
      if (!pathExists(absolutePath)) {
        return null;
      }

      const postCount = countMarkdownFiles(absolutePath, 3);
      if (postCount === 0) {
        return null;
      }

      return { contentDir: relativePath, postCount };
    })
    .filter((entry): entry is { contentDir: string; postCount: number } => entry !== null)
    .sort((left, right) => right.postCount - left.postCount);

  const scanned = findMarkdownContentDirs(root, 5)
    .filter((entry) => entry.postCount > 0)
    .map((entry) => ({
      contentDir: entry.relativePath,
      postCount: entry.postCount,
    }));

  const merged = new Map<string, number>();
  for (const entry of [...scored, ...scanned]) {
    const current = merged.get(entry.contentDir) ?? 0;
    merged.set(entry.contentDir, Math.max(current, entry.postCount));
  }

  const ranked = [...merged.entries()]
    .map(([contentDir, postCount]) => ({ contentDir, postCount }))
    .sort((left, right) => right.postCount - left.postCount);

  if (ranked.length === 0) {
    return {
      contentDir: fallbackContentDir,
      alternatives: [],
      postCount: 0,
    };
  }

  const [best, ...rest] = ranked;
  return {
    contentDir: best?.contentDir ?? fallbackContentDir,
    alternatives: rest.map((entry) => entry.contentDir),
    postCount: best?.postCount ?? 0,
  };
}
