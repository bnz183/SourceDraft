import type { Article } from "@sourcedraft/core";

export type MarkdownPathConfig = {
  contentDir: string;
  extension?: string;
};

export function getMarkdownPath(
  article: Article,
  config: MarkdownPathConfig,
): string {
  const contentDir = config.contentDir.replace(/\/+$/u, "");
  const rawExtension = config.extension ?? "md";
  const extension = rawExtension.startsWith(".")
    ? rawExtension.slice(1)
    : rawExtension;

  return `${contentDir}/${article.slug}.${extension}`;
}
