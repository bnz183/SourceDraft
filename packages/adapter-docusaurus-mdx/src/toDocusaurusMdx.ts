import type { Article, ArticleInput } from "@sourcedraft/core";
import { resolveDocusaurusMdxOptions } from "./options.js";
import {
  formatYamlAuthors,
  formatYamlTags,
  yamlScalar,
} from "./yaml.js";

function pushOptional(
  frontmatter: string[],
  key: string,
  value: string | undefined,
): void {
  if (value !== undefined) {
    frontmatter.push(`${key}: ${yamlScalar(value)}`);
  }
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

export function toDocusaurusMdx(
  article: Article,
  options?: Record<string, unknown>,
): string {
  const resolved = resolveDocusaurusMdxOptions(options);
  const frontmatter: string[] = [
    "---",
    `title: ${yamlScalar(article.title)}`,
    `description: ${yamlScalar(article.description)}`,
    `slug: ${yamlScalar(article.slug)}`,
  ];

  if (article.author !== undefined) {
    frontmatter.push(...formatYamlAuthors(article.author));
  }

  frontmatter.push(...formatYamlTags(article.tags));
  pushOptional(frontmatter, "image", article.heroImage);
  pushOptional(frontmatter, "metaTitle", article.metaTitle);
  pushOptional(frontmatter, "metaDescription", article.metaDescription);
  pushOptional(frontmatter, "canonicalUrl", article.canonicalUrl);
  pushOptional(frontmatter, "socialImage", article.socialImage);

  if (resolved.hideTableOfContents) {
    frontmatter.push("hide_table_of_contents: true");
  }

  frontmatter.push("---");

  return `${frontmatter.join("\n")}\n\n${article.body}`;
}

export function docusaurusMdxFromFrontmatter(
  path: string,
  frontmatter: Record<string, unknown>,
  body: string,
  slugFromPath: (path: string) => string,
): ArticleInput {
  const slug =
    typeof frontmatter.slug === "string" && frontmatter.slug.trim().length > 0
      ? frontmatter.slug.trim()
      : slugFromPath(path);

  const author =
    typeof frontmatter.author === "string"
      ? frontmatter.author
      : firstStringFromArray(frontmatter.authors);

  return {
    title: frontmatter.title,
    slug,
    description: frontmatter.description,
    pubDate: frontmatter.date ?? frontmatter.pubDate,
    category: frontmatter.category,
    tags: frontmatter.tags,
    draft: frontmatter.draft,
    heroImage: frontmatter.image ?? frontmatter.heroImage,
    body,
    author,
    metaTitle: frontmatter.metaTitle,
    metaDescription: frontmatter.metaDescription,
    canonicalUrl: frontmatter.canonicalUrl,
    socialImage: frontmatter.socialImage,
  };
}
