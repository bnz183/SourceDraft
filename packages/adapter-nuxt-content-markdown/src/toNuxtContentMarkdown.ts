import {
  appendSeoFrontmatterLines,
  mergeArticleInputWithSeo,
  type Article,
  type ArticleInput,
} from "@sourcedraft/core";
import { resolveNuxtContentMarkdownOptions } from "./options.js";
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

function formatNavigation(
  article: Article,
  navigation: string | boolean | undefined,
): string | undefined {
  if (navigation === true) {
    return "navigation: true";
  }

  if (typeof navigation === "string") {
    return `navigation: ${yamlScalar(navigation)}`;
  }

  return `navigation: ${yamlScalar(article.title)}`;
}

export function toNuxtContentMarkdown(
  article: Article,
  options?: Record<string, unknown>,
): string {
  const resolved = resolveNuxtContentMarkdownOptions(options);
  const frontmatter: string[] = [
    "---",
    `title: ${yamlScalar(article.title)}`,
    `description: ${yamlScalar(article.description)}`,
    `date: ${yamlScalar(article.pubDate)}`,
    `draft: ${article.draft}`,
    formatNavigation(article, resolved.navigation) as string,
    `category: ${yamlScalar(article.category)}`,
    ...formatYamlTags(article.tags),
  ];

  appendSeoFrontmatterLines(frontmatter, article, yamlScalar);
  frontmatter.push("---");

  return `${frontmatter.join("\n")}\n\n${article.body}`;
}

export function nuxtContentMarkdownFromFrontmatter(
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
      draft: frontmatter.draft,
      body,
    },
    frontmatter,
  );
}
