import type { Article, ArticleInput } from "@sourcedraft/core";

export const ADAPTER_IDS = [
  "astro-mdx",
  "markdown",
  "nextjs-mdx",
  "hugo-markdown",
  "eleventy-jekyll-markdown",
  "docusaurus-mdx",
  "mkdocs-markdown",
  "nuxt-content-markdown",
] as const;

/** Built-in adapter ids; plugins may register additional string ids at runtime. */
export type AdapterId = string;

export type AdapterPathConfig = {
  contentDir: string;
  adapterOptions?: Record<string, unknown>;
};

export type AdapterPreviewMeta = {
  label: string;
  extension: string;
  navHint?: string;
};

/** Converts a validated article into target file content and paths. */
export type Adapter = {
  id: AdapterId;
  previewMeta: AdapterPreviewMeta;
  render: (article: Article, adapterOptions?: Record<string, unknown>) => string;
  getPath: (article: Article, config: AdapterPathConfig) => string;
  fromFrontmatter: (
    path: string,
    frontmatter: Record<string, unknown>,
    body: string,
    slugFromPath: (path: string) => string,
  ) => ArticleInput;
  previewNavHint?: (
    article: Article,
    path: string,
    adapterOptions?: Record<string, unknown>,
  ) => string | undefined;
};

/** @deprecated Use `Adapter` */
export type AdapterDefinition = Adapter;
