import type { Article, ArticleInput } from "@sourcedraft/core";
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

export function toMkdocsMarkdown(article: Article): string {
  const frontmatter: string[] = [
    "---",
    `title: ${yamlScalar(article.title)}`,
    `description: ${yamlScalar(article.description)}`,
    `date: ${yamlScalar(article.pubDate)}`,
    ...formatYamlTags(article.tags),
  ];

  pushOptional(frontmatter, "metaTitle", article.metaTitle);
  pushOptional(frontmatter, "metaDescription", article.metaDescription);
  pushOptional(frontmatter, "canonicalUrl", article.canonicalUrl);
  pushOptional(frontmatter, "socialImage", article.socialImage);
  frontmatter.push("---");

  return `${frontmatter.join("\n")}\n\n${article.body}`;
}

export function mkdocsMarkdownFromFrontmatter(
  path: string,
  frontmatter: Record<string, unknown>,
  body: string,
  slugFromPath: (path: string) => string,
): ArticleInput {
  return {
    title: frontmatter.title,
    slug: slugFromPath(path),
    description: frontmatter.description,
    pubDate: frontmatter.date ?? frontmatter.pubDate,
    category: frontmatter.category,
    tags: frontmatter.tags,
    draft: frontmatter.draft ?? false,
    body,
    metaTitle: frontmatter.metaTitle,
    metaDescription: frontmatter.metaDescription,
    canonicalUrl: frontmatter.canonicalUrl,
    socialImage: frontmatter.socialImage,
  };
}
