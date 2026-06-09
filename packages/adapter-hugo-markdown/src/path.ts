import type { Article } from "@sourcedraft/core";
import { trimTrailingSlashes } from "@sourcedraft/core";

export type HugoMarkdownPathConfig = {
  contentDir: string;
  extension?: string;
};

export function getHugoMarkdownPath(
  article: Article,
  config: HugoMarkdownPathConfig,
): string {
  const contentDir = trimTrailingSlashes(config.contentDir);
  const rawExtension = config.extension ?? "md";
  const extension = rawExtension.startsWith(".")
    ? rawExtension.slice(1)
    : rawExtension;

  return `${contentDir}/${article.slug}.${extension}`;
}
