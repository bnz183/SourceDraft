import type { Article, ArticleInput } from "@sourcedraft/core";
import { resolveEleventyJekyllOptions } from "./options.js";
import { formatYamlTags, yamlScalar } from "./yaml.js";

function pushOptional(
  frontmatter: string[],
  key: string,
  value: string | undefined,
): void {
  if (value !== undefined) {
    frontmatter.push(`${key}: ${yamlScalar(value)}`);
  }
}

function buildPermalink(
  slug: string,
  prefix: string,
): string {
  const normalizedPrefix = prefix.endsWith("/") ? prefix : `${prefix}/`;
  if (normalizedPrefix === "/") {
    return `/${slug}/`;
  }

  return `${normalizedPrefix}${slug}/`;
}

export function toEleventyJekyllMarkdown(
  article: Article,
  options?: Record<string, unknown>,
): string {
  const resolved = resolveEleventyJekyllOptions(options);
  const frontmatter: string[] = [
    "---",
    `title: ${yamlScalar(article.title)}`,
    `description: ${yamlScalar(article.description)}`,
    `date: ${yamlScalar(article.pubDate)}`,
    `permalink: ${yamlScalar(buildPermalink(article.slug, resolved.permalinkPrefix))}`,
    `layout: ${yamlScalar(resolved.layout)}`,
    ...formatYamlTags(article.tags),
    `category: ${yamlScalar(article.category)}`,
    `draft: ${article.draft}`,
  ];

  pushOptional(frontmatter, "metaTitle", article.metaTitle);
  pushOptional(frontmatter, "metaDescription", article.metaDescription);
  pushOptional(frontmatter, "canonicalUrl", article.canonicalUrl);
  pushOptional(frontmatter, "socialImage", article.socialImage);
  frontmatter.push("---");

  return `${frontmatter.join("\n")}\n\n${article.body}`;
}

export function eleventyJekyllMarkdownFromFrontmatter(
  path: string,
  frontmatter: Record<string, unknown>,
  body: string,
  slugFromPath: (path: string) => string,
): ArticleInput {
  const filename = path.split("/").pop() ?? "";
  const slug =
    typeof frontmatter.slug === "string" && frontmatter.slug.trim().length > 0
      ? frontmatter.slug.trim()
      : slugFromPath(filename);

  return {
    title: frontmatter.title,
    slug,
    description: frontmatter.description,
    pubDate: frontmatter.date ?? frontmatter.pubDate,
    category: frontmatter.category,
    tags: frontmatter.tags,
    draft: frontmatter.draft,
    body,
    metaTitle: frontmatter.metaTitle,
    metaDescription: frontmatter.metaDescription,
    canonicalUrl: frontmatter.canonicalUrl,
    socialImage: frontmatter.socialImage,
  };
}
