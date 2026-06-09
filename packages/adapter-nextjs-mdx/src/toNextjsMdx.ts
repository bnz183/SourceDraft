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

export function toNextjsMdx(article: Article): string {
  const frontmatter: string[] = [
    "---",
    `title: ${yamlScalar(article.title)}`,
    `description: ${yamlScalar(article.description)}`,
    `date: ${yamlScalar(article.pubDate)}`,
  ];

  pushOptional(frontmatter, "updatedDate", article.updatedDate);
  frontmatter.push(`draft: ${article.draft}`);
  frontmatter.push(`slug: ${yamlScalar(article.slug)}`);
  frontmatter.push(`category: ${yamlScalar(article.category)}`);
  frontmatter.push(...formatYamlTags(article.tags));
  pushOptional(frontmatter, "author", article.author);
  pushOptional(frontmatter, "coverImage", article.heroImage);
  pushOptional(frontmatter, "metaTitle", article.metaTitle);
  pushOptional(frontmatter, "metaDescription", article.metaDescription);
  pushOptional(frontmatter, "canonicalUrl", article.canonicalUrl);
  pushOptional(frontmatter, "socialImage", article.socialImage);
  frontmatter.push("---");

  return `${frontmatter.join("\n")}\n\n${article.body}`;
}

export function nextjsMdxFromFrontmatter(
  path: string,
  frontmatter: Record<string, unknown>,
  body: string,
  slugFromPath: (path: string) => string,
): ArticleInput {
  const slug =
    typeof frontmatter.slug === "string" && frontmatter.slug.trim().length > 0
      ? frontmatter.slug.trim()
      : slugFromPath(path);

  const input: ArticleInput = {
    title: frontmatter.title,
    slug,
    description: frontmatter.description,
    pubDate: frontmatter.date ?? frontmatter.pubDate,
    updatedDate: frontmatter.updatedDate,
    category: frontmatter.category,
    tags: frontmatter.tags,
    draft: frontmatter.draft,
    heroImage: frontmatter.coverImage ?? frontmatter.heroImage,
    body,
    author: frontmatter.author,
    metaTitle: frontmatter.metaTitle,
    metaDescription: frontmatter.metaDescription,
    canonicalUrl: frontmatter.canonicalUrl,
    socialImage: frontmatter.socialImage,
  };

  return input;
}
