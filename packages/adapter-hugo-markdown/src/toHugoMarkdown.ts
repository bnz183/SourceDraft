import {
  appendSeoFrontmatterLines,
  mergeArticleInputWithSeo,
  type Article,
  type ArticleInput,
} from "@sourcedraft/core";
import { resolveHugoOptions } from "./options.js";
import { formatTomlArray, tomlString } from "./toml.js";
import {
  formatYamlCategories,
  formatYamlImages,
  formatYamlTags,
  yamlScalar,
} from "./yaml.js";

function pushYamlOptional(
  frontmatter: string[],
  key: string,
  value: string | undefined,
): void {
  if (value !== undefined) {
    frontmatter.push(`${key}: ${yamlScalar(value)}`);
  }
}

function renderYamlFrontmatter(article: Article): string[] {
  const frontmatter: string[] = [
    "---",
    `title: ${yamlScalar(article.title)}`,
    `description: ${yamlScalar(article.description)}`,
    `date: ${yamlScalar(article.pubDate)}`,
  ];

  pushYamlOptional(frontmatter, "lastmod", article.updatedDate);
  frontmatter.push(`draft: ${article.draft}`);
  pushYamlOptional(frontmatter, "slug", article.slug);
  frontmatter.push(...formatYamlCategories(article.category));
  frontmatter.push(...formatYamlTags(article.tags));

  if (article.heroImage !== undefined) {
    frontmatter.push(...formatYamlImages(article.heroImage));
  }

  appendSeoFrontmatterLines(frontmatter, article, yamlScalar);
  frontmatter.push("---");

  return frontmatter;
}

function renderTomlFrontmatter(article: Article): string[] {
  const lines: string[] = ["+++", `title = ${tomlString(article.title)}`];

  lines.push(`description = ${tomlString(article.description)}`);
  lines.push(`date = ${tomlString(article.pubDate)}`);

  if (article.updatedDate !== undefined) {
    lines.push(`lastmod = ${tomlString(article.updatedDate)}`);
  }

  lines.push(`draft = ${article.draft}`);
  lines.push(`slug = ${tomlString(article.slug)}`);
  lines.push(formatTomlArray("categories", [article.category]));
  lines.push(formatTomlArray("tags", article.tags));

  if (article.heroImage !== undefined) {
    lines.push(formatTomlArray("images", [article.heroImage]));
  }

  for (const [field, key] of [
    [article.author, "author"],
    [article.metaTitle, "metaTitle"],
    [article.metaDescription, "metaDescription"],
    [article.canonicalUrl, "canonicalUrl"],
    [article.socialImage, "socialImage"],
    [article.coverImageAlt, "coverImageAlt"],
  ] as const) {
    if (field !== undefined) {
      lines.push(`${key} = ${tomlString(field)}`);
    }
  }

  if (article.noindex === true) {
    lines.push("noindex = true");
  }

  if (article.readingTime !== undefined && article.readingTime > 0) {
    lines.push(`readingTime = ${article.readingTime}`);
  }

  lines.push("+++");
  return lines;
}

export function toHugoMarkdown(
  article: Article,
  options?: Record<string, unknown>,
): string {
  const resolved = resolveHugoOptions(options);
  const frontmatter =
    resolved.frontmatterFormat === "toml"
      ? renderTomlFrontmatter(article)
      : renderYamlFrontmatter(article);

  return `${frontmatter.join("\n")}\n\n${article.body}`;
}

function firstStringFromArray(value: unknown): string | undefined {
  if (!Array.isArray(value) || value.length === 0) {
    return undefined;
  }

  const first = value[0];
  return typeof first === "string" && first.trim().length > 0
    ? first.trim()
    : undefined;
}

export function hugoMarkdownFromFrontmatter(
  path: string,
  frontmatter: Record<string, unknown>,
  body: string,
  slugFromPath: (path: string) => string,
): ArticleInput {
  const slug =
    typeof frontmatter.slug === "string" && frontmatter.slug.trim().length > 0
      ? frontmatter.slug.trim()
      : slugFromPath(path);

  const category =
    typeof frontmatter.category === "string"
      ? frontmatter.category
      : firstStringFromArray(frontmatter.categories);

  const heroImage =
    typeof frontmatter.heroImage === "string"
      ? frontmatter.heroImage
      : firstStringFromArray(frontmatter.images);

  return mergeArticleInputWithSeo(
    {
      title: frontmatter.title,
      slug,
      description: frontmatter.description,
      pubDate: frontmatter.date ?? frontmatter.pubDate,
      updatedDate: frontmatter.lastmod ?? frontmatter.updatedDate,
      category,
      tags: frontmatter.tags,
      draft: frontmatter.draft,
      heroImage,
      body,
    },
    frontmatter,
  );
}
