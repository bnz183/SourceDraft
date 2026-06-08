import {
  appendSeoFrontmatterLines,
  mergeArticleInputWithSeo,
  type Article,
  type ArticleInput,
} from "@sourcedraft/core";
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

  appendSeoFrontmatterLines(frontmatter, article, yamlScalar);
  frontmatter.push("---");

  return `${frontmatter.join("\n")}\n\n${article.body}`;
}

export function mkdocsMarkdownFromFrontmatter(
  path: string,
  frontmatter: Record<string, unknown>,
  body: string,
  slugFromPath: (path: string) => string,
): ArticleInput {
  return mergeArticleInputWithSeo(
    {
      title: frontmatter.title,
      slug: slugFromPath(path),
      description: frontmatter.description,
      pubDate: frontmatter.date ?? frontmatter.pubDate,
      category: frontmatter.category,
      tags: frontmatter.tags,
      draft: frontmatter.draft ?? false,
      body,
    },
    frontmatter,
  );
}
