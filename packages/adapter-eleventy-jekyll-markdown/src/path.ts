import type { Article } from "@sourcedraft/core";
import { resolveEleventyJekyllOptions } from "./options.js";

export type EleventyJekyllMarkdownPathConfig = {
  contentDir: string;
  extension?: string;
  adapterOptions?: Record<string, unknown>;
};

export function slugFromFilename(filename: string): string {
  const withoutExtension = filename.replace(/\.(mdx|md)$/iu, "");
  const jekyllMatch = withoutExtension.match(/^\d{4}-\d{2}-\d{2}-(.+)$/u);
  if (jekyllMatch?.[1]) {
    return jekyllMatch[1];
  }

  return withoutExtension;
}

export function getEleventyJekyllMarkdownPath(
  article: Article,
  config: EleventyJekyllMarkdownPathConfig,
): string {
  const contentDir = config.contentDir.replace(/\/+$/u, "");
  const rawExtension = config.extension ?? "md";
  const extension = rawExtension.startsWith(".")
    ? rawExtension.slice(1)
    : rawExtension;
  const options = resolveEleventyJekyllOptions(config.adapterOptions);

  const filename = options.jekyllFilename
    ? `${article.pubDate}-${article.slug}.${extension}`
    : `${article.slug}.${extension}`;

  return `${contentDir}/${filename}`;
}
