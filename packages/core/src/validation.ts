import type {
  Article,
  ArticleInput,
  ValidationIssue,
  ValidationResult,
} from "./article.js";
import { computeReadingTimeMinutes, isValidCanonicalUrl } from "./seo.js";
import { isValidSlug } from "./slug.js";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function issue(field: string, message: string): ValidationIssue {
  return { field, message };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseDateField(
  value: unknown,
  field: "pubDate" | "updatedDate",
): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }
    return value.toISOString().slice(0, 10);
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  if (ISO_DATE_PATTERN.test(trimmed)) {
    const parsed = new Date(`${trimmed}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function normalizeTags(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const tags: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") {
      return null;
    }

    const tag = item.trim();
    if (tag.length === 0) {
      return null;
    }

    tags.push(tag);
  }

  return tags;
}

export function validateArticle(input: ArticleInput): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!isNonEmptyString(input.title)) {
    issues.push(issue("title", "Title is required."));
  }

  if (!isNonEmptyString(input.slug)) {
    issues.push(issue("slug", "Slug is required."));
  } else if (!isValidSlug(input.slug.trim())) {
    issues.push(
      issue(
        "slug",
        "Slug must contain only lowercase letters, numbers, and hyphens.",
      ),
    );
  }

  if (!isNonEmptyString(input.description)) {
    issues.push(issue("description", "Description is required."));
  }

  if (input.pubDate === undefined || input.pubDate === null) {
    issues.push(issue("pubDate", "Publication date is required."));
  } else if (parseDateField(input.pubDate, "pubDate") === null) {
    issues.push(issue("pubDate", "Publication date must be a valid date."));
  }

  if (
    input.updatedDate !== undefined &&
    input.updatedDate !== null &&
    parseDateField(input.updatedDate, "updatedDate") === null
  ) {
    issues.push(issue("updatedDate", "Updated date must be a valid date."));
  }

  if (!isNonEmptyString(input.category)) {
    issues.push(issue("category", "Category is required."));
  }

  if (input.tags === undefined || input.tags === null) {
    issues.push(issue("tags", "Tags must be an array."));
  } else if (normalizeTags(input.tags) === null) {
    issues.push(
      issue("tags", "Tags must be an array of non-empty strings."),
    );
  }

  if (typeof input.draft !== "boolean") {
    issues.push(issue("draft", "Draft must be a boolean."));
  }

  if (
    input.heroImage !== undefined &&
    input.heroImage !== null &&
    !isNonEmptyString(input.heroImage)
  ) {
    issues.push(issue("heroImage", "Hero image must be a non-empty string."));
  }

  for (const [field, label] of [
    ["author", "Author"],
    ["metaTitle", "Meta title"],
    ["metaDescription", "Meta description"],
    ["socialImage", "Social image"],
    ["coverImageAlt", "Cover image alt text"],
  ] as const) {
    const value = input[field];
    if (value !== undefined && value !== null && !isNonEmptyString(value)) {
      issues.push(issue(field, `${label} must be a non-empty string.`));
    }
  }

  if (
    input.canonicalUrl !== undefined &&
    input.canonicalUrl !== null &&
    isNonEmptyString(input.canonicalUrl) &&
    !isValidCanonicalUrl(input.canonicalUrl.trim())
  ) {
    issues.push(
      issue("canonicalUrl", "Canonical URL must be a valid http(s) URL."),
    );
  }

  if (
    input.canonicalUrl !== undefined &&
    input.canonicalUrl !== null &&
    !isNonEmptyString(input.canonicalUrl)
  ) {
    issues.push(issue("canonicalUrl", "Canonical URL must be a non-empty string."));
  }

  if (
    input.noindex !== undefined &&
    input.noindex !== null &&
    typeof input.noindex !== "boolean"
  ) {
    issues.push(issue("noindex", "Noindex must be a boolean."));
  }

  if (
    input.readingTime !== undefined &&
    input.readingTime !== null &&
    (typeof input.readingTime !== "number" ||
      !Number.isFinite(input.readingTime) ||
      input.readingTime < 0)
  ) {
    issues.push(issue("readingTime", "Reading time must be a non-negative number."));
  }

  if (!isNonEmptyString(input.body)) {
    issues.push(issue("body", "Body is required."));
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function normalizeArticle(input: ArticleInput): Article {
  const result = validateArticle(input);
  if (!result.valid) {
    const summary = result.issues.map((item) => item.message).join(" ");
    throw new Error(`Invalid article: ${summary}`);
  }

  const pubDate = parseDateField(input.pubDate, "pubDate");
  const updatedDate = parseDateField(input.updatedDate, "updatedDate");
  const tags = normalizeTags(input.tags);

  if (pubDate === null || tags === null) {
    throw new Error("Invalid article: normalization failed after validation.");
  }

  const article: Article = {
    title: (input.title as string).trim(),
    slug: (input.slug as string).trim(),
    description: (input.description as string).trim(),
    pubDate,
    category: (input.category as string).trim(),
    tags,
    draft: input.draft as boolean,
    body: (input.body as string).trim(),
  };

  if (updatedDate !== null) {
    article.updatedDate = updatedDate;
  }

  if (isNonEmptyString(input.heroImage)) {
    article.heroImage = input.heroImage.trim();
  }

  for (const field of [
    "author",
    "metaTitle",
    "metaDescription",
    "canonicalUrl",
    "socialImage",
    "coverImageAlt",
  ] as const) {
    const value = input[field];
    if (isNonEmptyString(value)) {
      article[field] = value.trim();
    }
  }

  if (input.noindex === true) {
    article.noindex = true;
  }

  const computedReadingTime = computeReadingTimeMinutes(article.body);
  if (computedReadingTime > 0) {
    article.readingTime = computedReadingTime;
  }

  return article;
}
