import { getAstroMdxPath, toAstroMdx } from "@sourcedraft/adapter-astro-mdx";
import {
  docusaurusMdxFromFrontmatter,
  getDocusaurusMdxPath,
  toDocusaurusMdx,
} from "@sourcedraft/adapter-docusaurus-mdx";
import {
  eleventyJekyllMarkdownFromFrontmatter,
  getEleventyJekyllMarkdownPath,
  toEleventyJekyllMarkdown,
} from "@sourcedraft/adapter-eleventy-jekyll-markdown";
import {
  getHugoMarkdownPath,
  hugoMarkdownFromFrontmatter,
  toHugoMarkdown,
} from "@sourcedraft/adapter-hugo-markdown";
import { getMarkdownPath, toMarkdown } from "@sourcedraft/adapter-markdown";
import {
  buildMkdocsNavHint,
  getMkdocsMarkdownPath,
  mkdocsMarkdownFromFrontmatter,
  toMkdocsMarkdown,
} from "@sourcedraft/adapter-mkdocs-markdown";
import {
  getNextjsMdxPath,
  nextjsMdxFromFrontmatter,
  toNextjsMdx,
} from "@sourcedraft/adapter-nextjs-mdx";
import {
  getNuxtContentMarkdownPath,
  nuxtContentMarkdownFromFrontmatter,
  toNuxtContentMarkdown,
} from "@sourcedraft/adapter-nuxt-content-markdown";
import { mergeArticleInputWithSeo } from "@sourcedraft/core";
import { registerAdapter } from "./adapterRegistry.js";

function astroFromFrontmatter(
  path: string,
  frontmatter: Record<string, unknown>,
  body: string,
  slugFromPath: (path: string) => string,
) {
  const slug =
    typeof frontmatter.slug === "string" && frontmatter.slug.trim().length > 0
      ? frontmatter.slug.trim()
      : slugFromPath(path);

  return mergeArticleInputWithSeo(
    {
      title: frontmatter.title,
      slug,
      description: frontmatter.description,
      pubDate: frontmatter.pubDate,
      updatedDate: frontmatter.updatedDate,
      category: frontmatter.category,
      tags: frontmatter.tags,
      draft: frontmatter.draft,
      heroImage: frontmatter.heroImage,
      body,
    },
    frontmatter,
  );
}

export function registerBuiltInAdapters(): void {
  registerAdapter({
    id: "astro-mdx",
    previewMeta: { label: "MDX preview", extension: "mdx" },
    render: toAstroMdx,
    getPath: (article, config) => getAstroMdxPath(article, config),
    fromFrontmatter: astroFromFrontmatter,
  });

  registerAdapter({
    id: "markdown",
    previewMeta: { label: "Markdown preview", extension: "md" },
    render: toMarkdown,
    getPath: (article, config) => getMarkdownPath(article, config),
    fromFrontmatter: astroFromFrontmatter,
  });

  registerAdapter({
    id: "nextjs-mdx",
    previewMeta: { label: "Next.js MDX preview", extension: "mdx" },
    render: toNextjsMdx,
    getPath: (article, config) => getNextjsMdxPath(article, config),
    fromFrontmatter: nextjsMdxFromFrontmatter,
  });

  registerAdapter({
    id: "hugo-markdown",
    previewMeta: { label: "Hugo Markdown preview", extension: "md" },
    render: toHugoMarkdown,
    getPath: (article, config) => getHugoMarkdownPath(article, config),
    fromFrontmatter: hugoMarkdownFromFrontmatter,
  });

  registerAdapter({
    id: "eleventy-jekyll-markdown",
    previewMeta: {
      label: "Eleventy/Jekyll Markdown preview",
      extension: "md",
    },
    render: toEleventyJekyllMarkdown,
    getPath: (article, config) =>
      getEleventyJekyllMarkdownPath(article, {
        contentDir: config.contentDir,
        ...(config.adapterOptions !== undefined
          ? { adapterOptions: config.adapterOptions }
          : {}),
      }),
    fromFrontmatter: eleventyJekyllMarkdownFromFrontmatter,
  });

  registerAdapter({
    id: "docusaurus-mdx",
    previewMeta: { label: "Docusaurus MDX preview", extension: "mdx" },
    render: toDocusaurusMdx,
    getPath: (article, config) =>
      getDocusaurusMdxPath(article, {
        contentDir: config.contentDir,
        ...(config.adapterOptions !== undefined
          ? { adapterOptions: config.adapterOptions }
          : {}),
      }),
    fromFrontmatter: docusaurusMdxFromFrontmatter,
  });

  registerAdapter({
    id: "mkdocs-markdown",
    previewMeta: {
      label: "MkDocs Markdown preview",
      extension: "md",
      navHint: "Published files must be wired into mkdocs.yml nav manually.",
    },
    render: toMkdocsMarkdown,
    getPath: (article, config) =>
      getMkdocsMarkdownPath(article, {
        contentDir: config.contentDir,
        ...(config.adapterOptions !== undefined
          ? { adapterOptions: config.adapterOptions }
          : {}),
      }),
    fromFrontmatter: mkdocsMarkdownFromFrontmatter,
    previewNavHint: (article, path, adapterOptions) => {
      const navSection =
        typeof adapterOptions?.navSection === "string"
          ? adapterOptions.navSection
          : undefined;
      return buildMkdocsNavHint(article.title, path, navSection);
    },
  });

  registerAdapter({
    id: "nuxt-content-markdown",
    previewMeta: { label: "Nuxt Content Markdown preview", extension: "md" },
    render: toNuxtContentMarkdown,
    getPath: (article, config) =>
      getNuxtContentMarkdownPath(article, {
        contentDir: config.contentDir,
        ...(config.adapterOptions !== undefined
          ? { adapterOptions: config.adapterOptions }
          : {}),
      }),
    fromFrontmatter: nuxtContentMarkdownFromFrontmatter,
  });
}

registerBuiltInAdapters();
