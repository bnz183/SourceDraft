import type { Article, ArticleInput } from "./article.js";
import { computeReadingTimeMinutes } from "./seo.js";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseBooleanField(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true" || value === "yes" || value === 1 || value === "1") {
    return true;
  }

  if (value === "false" || value === "no" || value === 0 || value === "0") {
    return false;
  }

  return undefined;
}

export function parseSeoFromFrontmatter(
  frontmatter: Record<string, unknown>,
): ArticleInput {
  const input: ArticleInput = {};

  if (isNonEmptyString(frontmatter.author)) {
    input.author = frontmatter.author.trim();
  }

  if (isNonEmptyString(frontmatter.metaTitle)) {
    input.metaTitle = frontmatter.metaTitle.trim();
  }

  if (isNonEmptyString(frontmatter.metaDescription)) {
    input.metaDescription = frontmatter.metaDescription.trim();
  }

  if (isNonEmptyString(frontmatter.canonicalUrl)) {
    input.canonicalUrl = frontmatter.canonicalUrl.trim();
  }

  if (isNonEmptyString(frontmatter.socialImage)) {
    input.socialImage = frontmatter.socialImage.trim();
  }

  const coverAlt =
    typeof frontmatter.coverImageAlt === "string"
      ? frontmatter.coverImageAlt
      : typeof frontmatter.heroImageAlt === "string"
        ? frontmatter.heroImageAlt
        : undefined;

  if (isNonEmptyString(coverAlt)) {
    input.coverImageAlt = coverAlt.trim();
  }

  const noindex = parseBooleanField(frontmatter.noindex);
  if (noindex !== undefined) {
    input.noindex = noindex;
  }

  if (typeof frontmatter.readingTime === "number" && frontmatter.readingTime > 0) {
    input.readingTime = frontmatter.readingTime;
  }

  return input;
}

export function mergeArticleInputWithSeo(
  base: ArticleInput,
  frontmatter: Record<string, unknown>,
): ArticleInput {
  return {
    ...base,
    ...parseSeoFromFrontmatter(frontmatter),
  };
}

export type AppendSeoFrontmatterOptions = {
  skipFields?: Array<keyof Article>;
};

export function appendSeoFrontmatterLines(
  lines: string[],
  article: Article,
  yamlScalar: (value: string) => string,
  options?: AppendSeoFrontmatterOptions,
): void {
  const skip = new Set(options?.skipFields ?? []);
  const optionalStringFields: Array<[keyof Article, string]> = [
    ["author", "author"],
    ["metaTitle", "metaTitle"],
    ["metaDescription", "metaDescription"],
    ["canonicalUrl", "canonicalUrl"],
    ["socialImage", "socialImage"],
    ["coverImageAlt", "coverImageAlt"],
  ];

  for (const [field, key] of optionalStringFields) {
    if (skip.has(field)) {
      continue;
    }
    const value = article[field];
    if (typeof value === "string" && value.trim().length > 0) {
      lines.push(`${key}: ${yamlScalar(value.trim())}`);
    }
  }

  if (article.noindex === true) {
    lines.push("noindex: true");
  }

  const readingTime = computeReadingTimeMinutes(article.body);
  if (readingTime > 0) {
    lines.push(`readingTime: ${readingTime}`);
  }
}
