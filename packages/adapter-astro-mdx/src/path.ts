import type { Article } from "@sourcedraft/core";
import { trimTrailingSlashes } from "@sourcedraft/core";

export type AstroMdxPathConfig = {
  contentDir: string;
  extension?: string;
};

export function getAstroMdxPath(
  article: Article,
  config: AstroMdxPathConfig,
): string {
  const contentDir = trimTrailingSlashes(config.contentDir);
  const rawExtension = config.extension ?? "mdx";
  const extension = rawExtension.startsWith(".")
    ? rawExtension.slice(1)
    : rawExtension;

  return `${contentDir}/${article.slug}.${extension}`;
}
