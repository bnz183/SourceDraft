import type { AdapterId } from "@sourcedraft/adapters";
import { frontmatterToArticleInputWithSlug } from "@sourcedraft/adapters";
import { validateArticle } from "@sourcedraft/core";
import { splitFrontmatter } from "./frontmatter.js";
import { hasComplexMdx } from "./mdxComplexity.js";

export type ContentAuditIssueKind =
  | "missing-frontmatter"
  | "missing-field"
  | "unsupported-field"
  | "invalid-date"
  | "validation"
  | "complex-mdx"
  | "ignored-file";

export type ContentAuditIssue = {
  kind: ContentAuditIssueKind;
  field?: string;
  message: string;
};

export type ContentAuditPost = {
  path: string;
  slug: string;
  title: string;
  status: "valid" | "invalid" | "source-only";
  issues: ContentAuditIssue[];
};

export type DuplicateSlugGroup = {
  slug: string;
  paths: string[];
};

export type ContentAuditSummary = {
  totalFiles: number;
  validCount: number;
  invalidCount: number;
  sourceOnlyCount: number;
  ignoredCount: number;
};

export type ContentAuditReport = {
  adapter: string;
  contentDir: string;
  summary: ContentAuditSummary;
  validPosts: ContentAuditPost[];
  invalidPosts: ContentAuditPost[];
  sourceOnlyPosts: ContentAuditPost[];
  duplicateSlugs: DuplicateSlugGroup[];
  ignoredFiles: { path: string; reason: string }[];
  warnings: string[];
};

const UNIVERSAL_FRONTMATTER_FIELDS = new Set([
  "title",
  "slug",
  "description",
  "pubDate",
  "updatedDate",
  "category",
  "tags",
  "draft",
  "heroImage",
  "author",
  "metaTitle",
  "metaDescription",
  "canonicalUrl",
  "socialImage",
  "coverImageAlt",
  "heroImageAlt",
  "noindex",
  "readingTime",
]);

const ADAPTER_EXTRA_FIELDS: Record<string, Set<string>> = {
  "astro-mdx": new Set(),
  markdown: new Set(),
  "nextjs-mdx": new Set(["date", "coverImage"]),
  "hugo-markdown": new Set([
    "date",
    "lastmod",
    "categories",
    "images",
    "slug",
    "weight",
  ]),
  "eleventy-jekyll-markdown": new Set(["date", "layout", "permalink", "eleventyExcludeFromCollections"]),
  "docusaurus-mdx": new Set([
    "date",
    "image",
    "authors",
    "author",
    "hide_table_of_contents",
    "slug",
  ]),
  "mkdocs-markdown": new Set(["date"]),
  "nuxt-content-markdown": new Set(["date", "image"]),
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

function slugFromFilename(path: string): string {
  const filename = path.split("/").pop() ?? "";
  return filename.replace(/\.(mdx?|markdown)$/iu, "");
}

function isValidDateValue(value: unknown): boolean {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return false;
  }

  if (ISO_DATE_PATTERN.test(trimmed)) {
    const parsed = new Date(`${trimmed}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime());
  }

  const parsed = new Date(trimmed);
  return !Number.isNaN(parsed.getTime());
}

function allowedFrontmatterFields(adapter: string): Set<string> {
  const allowed = new Set(UNIVERSAL_FRONTMATTER_FIELDS);
  const extras = ADAPTER_EXTRA_FIELDS[adapter];
  if (extras) {
    for (const field of extras) {
      allowed.add(field);
    }
  }

  return allowed;
}

function findUnsupportedFields(
  frontmatter: Record<string, unknown>,
  adapter: string,
): string[] {
  const allowed = allowedFrontmatterFields(adapter);
  return Object.keys(frontmatter).filter((key) => !allowed.has(key));
}

function findMissingRequiredFields(
  frontmatter: Record<string, unknown>,
  adapter: string,
): string[] {
  const missing: string[] = [];
  const required = ["title", "description"];

  for (const field of required) {
    const value = frontmatter[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      missing.push(field);
    }
  }

  const pubDate = frontmatter.pubDate ?? frontmatter.date;
  if (pubDate === undefined || pubDate === null) {
    missing.push("pubDate");
  }

  if (adapter !== "mkdocs-markdown") {
    const category = frontmatter.category ?? frontmatter.categories;
    if (
      (typeof category !== "string" || category.trim().length === 0) &&
      !Array.isArray(category)
    ) {
      missing.push("category");
    }
  }

  return missing;
}

function findInvalidDates(frontmatter: Record<string, unknown>): string[] {
  const invalid: string[] = [];

  for (const field of ["pubDate", "date", "updatedDate", "lastmod"]) {
    const value = frontmatter[field];
    if (value !== undefined && value !== null && !isValidDateValue(value)) {
      invalid.push(field);
    }
  }

  return invalid;
}

export function isPostFilePath(path: string): boolean {
  return /\.(md|mdx)$/iu.test(path);
}

export type AuditPostInput = {
  path: string;
  content: string;
};

export function auditPostFile(
  input: AuditPostInput,
  adapter: AdapterId,
  slugFromPath: (path: string) => string = slugFromFilename,
): ContentAuditPost {
  const issues: ContentAuditIssue[] = [];

  if (!isPostFilePath(input.path)) {
    return {
      path: input.path,
      slug: slugFromPath(input.path),
      title: slugFromPath(input.path),
      status: "invalid",
      issues: [
        {
          kind: "ignored-file",
          message: "File is not a Markdown or MDX post.",
        },
      ],
    };
  }

  const parsed = splitFrontmatter(input.content);
  if (parsed === null) {
    return {
      path: input.path,
      slug: slugFromPath(input.path),
      title: slugFromPath(input.path),
      status: "invalid",
      issues: [
        {
          kind: "missing-frontmatter",
          message: "Frontmatter block is missing or malformed.",
        },
      ],
    };
  }

  const { frontmatter, body } = parsed;

  for (const field of findMissingRequiredFields(frontmatter, adapter)) {
    issues.push({
      kind: "missing-field",
      field,
      message: `Missing or empty required field: ${field}.`,
    });
  }

  for (const field of findUnsupportedFields(frontmatter, adapter)) {
    issues.push({
      kind: "unsupported-field",
      field,
      message: `Unsupported frontmatter field for ${adapter}: ${field}.`,
    });
  }

  for (const field of findInvalidDates(frontmatter)) {
    issues.push({
      kind: "invalid-date",
      field,
      message: `Invalid date value for ${field}.`,
    });
  }

  const complexMdx = hasComplexMdx(body);
  if (complexMdx) {
    issues.push({
      kind: "complex-mdx",
      message:
        "Body contains MDX imports, exports, or JSX. Edit in source mode to avoid accidental changes.",
    });
  }

  let article;
  try {
    article = frontmatterToArticleInputWithSlug(
      adapter,
      input.path,
      frontmatter,
      body,
      slugFromPath,
    );
  } catch (error) {
    issues.push({
      kind: "validation",
      message:
        error instanceof Error
          ? error.message
          : "Could not map frontmatter to article input.",
    });

    return {
      path: input.path,
      slug: slugFromPath(input.path),
      title:
        typeof frontmatter.title === "string"
          ? frontmatter.title
          : slugFromPath(input.path),
      status: complexMdx ? "source-only" : "invalid",
      issues,
    };
  }

  const validation = validateArticle(article);
  if (!validation.valid) {
    for (const issue of validation.issues) {
      issues.push({
        kind: "validation",
        field: issue.field,
        message: issue.message,
      });
    }
  }

  const slug =
    typeof article.slug === "string" && article.slug.trim().length > 0
      ? article.slug.trim()
      : slugFromPath(input.path);
  const title =
    typeof article.title === "string" && article.title.trim().length > 0
      ? article.title.trim()
      : slug;

  if (complexMdx) {
    return {
      path: input.path,
      slug,
      title,
      status: "source-only",
      issues,
    };
  }

  if (issues.length > 0) {
    return {
      path: input.path,
      slug,
      title,
      status: "invalid",
      issues,
    };
  }

  return {
    path: input.path,
    slug,
    title,
    status: "valid",
    issues: [],
  };
}

export function buildContentAuditReport(
  files: AuditPostInput[],
  adapter: AdapterId,
  contentDir: string,
  slugFromPath: (path: string) => string = slugFromFilename,
): ContentAuditReport {
  const validPosts: ContentAuditPost[] = [];
  const invalidPosts: ContentAuditPost[] = [];
  const sourceOnlyPosts: ContentAuditPost[] = [];
  const ignoredFiles: { path: string; reason: string }[] = [];
  const warnings: string[] = [];
  const slugIndex = new Map<string, string[]>();

  for (const file of files) {
    if (!isPostFilePath(file.path)) {
      ignoredFiles.push({
        path: file.path,
        reason: "Not a .md or .mdx file — left unchanged during audit.",
      });
      continue;
    }

    const audited = auditPostFile(file, adapter, slugFromPath);

    if (audited.status === "valid") {
      validPosts.push(audited);
      const paths = slugIndex.get(audited.slug) ?? [];
      paths.push(audited.path);
      slugIndex.set(audited.slug, paths);
      continue;
    }

    if (audited.status === "source-only") {
      sourceOnlyPosts.push(audited);
      const paths = slugIndex.get(audited.slug) ?? [];
      paths.push(audited.path);
      slugIndex.set(audited.slug, paths);
      continue;
    }

    invalidPosts.push(audited);
    const paths = slugIndex.get(audited.slug) ?? [];
    paths.push(audited.path);
    slugIndex.set(audited.slug, paths);
  }

  const duplicateSlugs: DuplicateSlugGroup[] = [];
  for (const [slug, paths] of slugIndex) {
    if (paths.length > 1) {
      duplicateSlugs.push({ slug, paths: [...paths] });
    }
  }

  if (duplicateSlugs.length > 0) {
    warnings.push(
      `${duplicateSlugs.length} duplicate slug(s) found across post files.`,
    );
  }

  if (sourceOnlyPosts.length > 0) {
    warnings.push(
      `${sourceOnlyPosts.length} post(s) contain complex MDX and should remain source-only in the rich editor.`,
    );
  }

  return {
    adapter,
    contentDir,
    summary: {
      totalFiles: files.length,
      validCount: validPosts.length,
      invalidCount: invalidPosts.length,
      sourceOnlyCount: sourceOnlyPosts.length,
      ignoredCount: ignoredFiles.length,
    },
    validPosts,
    invalidPosts,
    sourceOnlyPosts,
    duplicateSlugs,
    ignoredFiles,
    warnings,
  };
}
