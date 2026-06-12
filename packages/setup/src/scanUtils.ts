import { existsSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

export const SCAN_IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".astro",
  "vendor",
  ".cache",
  "coverage",
  ".turbo",
  ".vercel",
  ".pnpm-store",
  ".source-draft",
]);

const MARKDOWN_EXTENSIONS = [".md", ".mdx", ".markdown"] as const;

export function isMarkdownFilename(filename: string): boolean {
  const lower = filename.toLowerCase();
  return MARKDOWN_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

export function pathExists(path: string): boolean {
  return existsSync(path);
}

export function countMarkdownFiles(
  dir: string,
  maxDepth = 3,
  currentDepth = 0,
): number {
  if (!pathExists(dir) || currentDepth > maxDepth) {
    return 0;
  }

  let count = 0;

  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && isMarkdownFilename(entry.name)) {
        count += 1;
        continue;
      }

      if (!entry.isDirectory() || SCAN_IGNORE_DIRS.has(entry.name)) {
        continue;
      }

      count += countMarkdownFiles(join(dir, entry.name), maxDepth, currentDepth + 1);
    }
  } catch {
    return count;
  }

  return count;
}

export function findMarkdownContentDirs(
  root: string,
  maxDepth = 5,
): Array<{ relativePath: string; postCount: number }> {
  const results: Array<{ relativePath: string; postCount: number }> = [];

  function walk(dir: string, depth: number): void {
    if (depth > maxDepth || !pathExists(dir)) {
      return;
    }

    let directMarkdown = 0;

    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && isMarkdownFilename(entry.name)) {
          directMarkdown += 1;
        }
      }

      if (directMarkdown > 0) {
        results.push({
          relativePath: relative(root, dir).replace(/\\/gu, "/"),
          postCount: countMarkdownFiles(dir, 2),
        });
      }

      for (const entry of entries) {
        if (!entry.isDirectory() || SCAN_IGNORE_DIRS.has(entry.name)) {
          continue;
        }

        walk(join(dir, entry.name), depth + 1);
      }
    } catch {
      return;
    }
  }

  walk(root, 0);

  return results.sort((left, right) => right.postCount - left.postCount);
}

export function listSampleMarkdownFiles(
  root: string,
  contentDir: string,
  maxFiles = 5,
): string[] {
  const base = join(root, contentDir);
  if (!pathExists(base)) {
    return [];
  }

  const files: string[] = [];

  function walk(dir: string, depth: number): void {
    if (files.length >= maxFiles || depth > 4) {
      return;
    }

    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (files.length >= maxFiles) {
          return;
        }

        const fullPath = join(dir, entry.name);
        if (entry.isFile() && isMarkdownFilename(entry.name)) {
          files.push(relative(root, fullPath).replace(/\\/gu, "/"));
          continue;
        }

        if (entry.isDirectory() && !SCAN_IGNORE_DIRS.has(entry.name)) {
          walk(fullPath, depth + 1);
        }
      }
    } catch {
      return;
    }
  }

  walk(base, 0);
  return files;
}
