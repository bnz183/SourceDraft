import type { Article } from "@sourcedraft/core";

export type AstroMdxPathConfig = {
  contentDir: string;
  extension?: string;
};

export function getAstroMdxPath(
  article: Article,
  config: AstroMdxPathConfig,
): string {
  const contentDir = config.contentDir.replace(/\/+$/u, "");
  const rawExtension = config.extension ?? "mdx";
  const extension = rawExtension.startsWith(".")
    ? rawExtension.slice(1)
    : rawExtension;

  return `${contentDir}/${article.slug}.${extension}`;
}
