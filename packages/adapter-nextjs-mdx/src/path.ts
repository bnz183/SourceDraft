import type { Article } from "@sourcedraft/core";

export type NextjsMdxPathConfig = {
  contentDir: string;
  extension?: string;
};

export function getNextjsMdxPath(
  article: Article,
  config: NextjsMdxPathConfig,
): string {
  const contentDir = config.contentDir.replace(/\/+$/u, "");
  const rawExtension = config.extension ?? "mdx";
  const extension = rawExtension.startsWith(".")
    ? rawExtension.slice(1)
    : rawExtension;

  return `${contentDir}/${article.slug}.${extension}`;
}
