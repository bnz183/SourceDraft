import type { Article } from "@sourcedraft/core";
import {
  resolveDocusaurusMdxOptions,
  type FilenameConvention,
} from "./options.js";

export type DocusaurusMdxPathConfig = {
  contentDir: string;
  extension?: string;
  adapterOptions?: Record<string, unknown>;
};

export function slugFromFilename(filename: string): string {
  const base = filename.replace(/\/index\.(mdx|md)$/iu, "").replace(/\.(mdx|md)$/iu, "");
  const dateMatch = base.match(/^\d{4}-\d{2}-\d{2}-(.+)$/u);
  if (dateMatch?.[1]) {
    return dateMatch[1];
  }

  const segments = base.split("/");
  return segments[segments.length - 1] ?? base;
}

function buildFilename(
  article: Article,
  extension: string,
  convention: FilenameConvention,
): string {
  switch (convention) {
    case "date-slug":
      return `${article.pubDate}-${article.slug}.${extension}`;
    case "index":
      return `${article.slug}/index.${extension}`;
    default:
      return `${article.slug}.${extension}`;
  }
}

export function getDocusaurusMdxPath(
  article: Article,
  config: DocusaurusMdxPathConfig,
): string {
  const contentDir = config.contentDir.replace(/\/+$/u, "");
  const rawExtension = config.extension ?? "mdx";
  const extension = rawExtension.startsWith(".")
    ? rawExtension.slice(1)
    : rawExtension;
  const options = resolveDocusaurusMdxOptions(config.adapterOptions);

  return `${contentDir}/${buildFilename(article, extension, options.filenameConvention)}`;
}
