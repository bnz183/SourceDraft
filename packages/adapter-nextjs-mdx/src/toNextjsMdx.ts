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
  pushOptional(frontmatter, "coverImage", article.heroImage);
  appendSeoFrontmatterLines(frontmatter, article, yamlScalar);
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

  return mergeArticleInputWithSeo(
    {
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
    },
    frontmatter,
  );
}
