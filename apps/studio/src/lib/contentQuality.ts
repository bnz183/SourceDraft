import type { ValidationIssue } from "@sourcedraft/core";
import {
  META_DESCRIPTION_LENGTH_GUIDANCE,
  META_TITLE_LENGTH_GUIDANCE,
} from "@sourcedraft/core";
import { analyzeDocumentOutline } from "./documentOutline.js";

export type ContentQualityInput = {
  title: string;
  description: string;
  body: string;
  heroImage: string;
  metaTitle?: string;
  metaDescription?: string;
  socialImage?: string;
  coverImageAlt?: string;
};

export type ContentQualityContext = {
  knownPostSlugs?: string[];
};

const LONG_ARTICLE_WORD_THRESHOLD = 400;
const SHORT_BODY_WORD_THRESHOLD = 100;
const EXTERNAL_LINK_WARN_THRESHOLD = 8;

export type LinkCounts = {
  internal: number;
  external: number;
};

export type ImageAnalysis = {
  total: number;
  missingAlt: number;
};

export type ContentQualityMetrics = {
  wordCount: number;
  readingTimeMinutes: number;
  titleLength: number;
  descriptionLength: number;
  hasCoverImage: boolean;
  hasHeading: boolean;
  internalLinkCount: number;
  externalLinkCount: number;
  imageCount: number;
  imagesMissingAlt: number;
};

export type ContentQualityWarning = {
  id: string;
  kind: "info" | "warn";
  message: string;
};

const WORDS_PER_MINUTE = 200;
const TITLE_LENGTH_GUIDANCE = META_TITLE_LENGTH_GUIDANCE;
const DESCRIPTION_LENGTH_GUIDANCE = META_DESCRIPTION_LENGTH_GUIDANCE;

const MARKDOWN_LINK_PATTERN =
  /(?<!!)\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/gu;

const MARKDOWN_IMAGE_PATTERN =
  /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/gu;

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return 0;
  }

  return trimmed.split(/\s+/u).length;
}

export function estimateReadingTimeMinutes(wordCount: number): number {
  if (wordCount === 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function hasMarkdownHeading(body: string): boolean {
  return analyzeDocumentOutline(body).headings.length > 0;
}

function isExternalUrl(url: string): boolean {
  const trimmed = url.trim();
  return /^https?:\/\//iu.test(trimmed) || /^\/\//u.test(trimmed);
}

export function countMarkdownLinks(body: string): LinkCounts {
  const counts: LinkCounts = { internal: 0, external: 0 };
  const pattern = new RegExp(MARKDOWN_LINK_PATTERN.source, "gu");

  for (const match of body.matchAll(pattern)) {
    const url = match[2] ?? "";
    if (isExternalUrl(url)) {
      counts.external += 1;
    } else {
      counts.internal += 1;
    }
  }

  return counts;
}

export function analyzeMarkdownImages(body: string): ImageAnalysis {
  const pattern = new RegExp(MARKDOWN_IMAGE_PATTERN.source, "gu");
  let total = 0;
  let missingAlt = 0;

  for (const match of body.matchAll(pattern)) {
    total += 1;
    const alt = match[1] ?? "";
    if (alt.trim().length === 0) {
      missingAlt += 1;
    }
  }

  return { total, missingAlt };
}

export function buildContentQualityMetrics(
  input: ContentQualityInput,
): ContentQualityMetrics {
  const wordCount = countWords(input.body);
  const links = countMarkdownLinks(input.body);
  const images = analyzeMarkdownImages(input.body);

  return {
    wordCount,
    readingTimeMinutes: estimateReadingTimeMinutes(wordCount),
    titleLength: input.title.trim().length,
    descriptionLength: input.description.trim().length,
    hasCoverImage: input.heroImage.trim().length > 0,
    hasHeading: hasMarkdownHeading(input.body),
    internalLinkCount: links.internal,
    externalLinkCount: links.external,
    imageCount: images.total,
    imagesMissingAlt: images.missingAlt,
  };
}

function normalizeInternalSlug(target: string): string | null {
  const trimmed = target.trim();
  if (trimmed.length === 0 || trimmed.startsWith("#")) {
    return null;
  }

  const withoutQuery = trimmed.split("?")[0]?.split("#")[0] ?? trimmed;
  const postMatch = withoutQuery.match(/\/post\/([^/]+)\/?$/u);
  if (postMatch?.[1]) {
    return postMatch[1];
  }

  const slugMatch = withoutQuery.match(/^\/([^/]+)\/?$/u);
  if (slugMatch?.[1] && !slugMatch[1].includes(".")) {
    return slugMatch[1];
  }

  return null;
}

export function findBrokenInternalLinks(
  body: string,
  knownSlugs: Set<string>,
): string[] {
  const broken: string[] = [];
  const pattern = new RegExp(MARKDOWN_LINK_PATTERN.source, "gu");

  for (const match of body.matchAll(pattern)) {
    const url = match[2] ?? "";
    if (isExternalUrl(url)) {
      continue;
    }

    const slug = normalizeInternalSlug(url);
    if (slug !== null && knownSlugs.size > 0 && !knownSlugs.has(slug)) {
      broken.push(url);
    }
  }

  return broken;
}

export function buildContentQualityWarnings(
  input: ContentQualityInput,
  metrics: ContentQualityMetrics,
  validationIssues: ValidationIssue[],
  context: ContentQualityContext = {},
): ContentQualityWarning[] {
  const warnings: ContentQualityWarning[] = [];
  const issueFields = new Set(validationIssues.map((issue) => issue.field));

  for (const issue of validationIssues) {
    warnings.push({
      id: `required-${issue.field}`,
      kind: "warn",
      message: `${issue.field}: ${issue.message}`,
    });
  }

  if (metrics.titleLength === 0 && !issueFields.has("title")) {
    warnings.push({
      id: "title-empty",
      kind: "warn",
      message: "Title is empty.",
    });
  } else if (metrics.titleLength > TITLE_LENGTH_GUIDANCE) {
    warnings.push({
      id: "title-long",
      kind: "info",
      message: `Title is ${metrics.titleLength} characters. Shorter titles are often easier to scan in lists.`,
    });
  }

  if (metrics.descriptionLength === 0 && !issueFields.has("description")) {
    warnings.push({
      id: "description-empty",
      kind: "warn",
      message: "Description is empty.",
    });
  } else if (metrics.descriptionLength > DESCRIPTION_LENGTH_GUIDANCE) {
    warnings.push({
      id: "description-long",
      kind: "info",
      message: `Description is ${metrics.descriptionLength} characters. Summaries are often kept shorter for excerpts.`,
    });
  }

  if (!metrics.hasCoverImage) {
    warnings.push({
      id: "cover-missing",
      kind: "info",
      message: "No cover image path set.",
    });
  }

  if (metrics.wordCount > 0 && !metrics.hasHeading) {
    warnings.push({
      id: "heading-missing",
      kind: "info",
      message: "Body has no Markdown heading (# syntax).",
    });
  }

  const outline = analyzeDocumentOutline(input.body);
  if (outline.h1Count > 1) {
    warnings.push({
      id: "multiple-h1",
      kind: "info",
      message: `Body has ${outline.h1Count} H1 headings. One title-level heading is usually enough.`,
    });
  }

  if (
    metrics.wordCount > 0 &&
    outline.headings.length > 0 &&
    !outline.hasSubheading
  ) {
    warnings.push({
      id: "no-subheadings",
      kind: "info",
      message: "Body has headings but no H2 or H3 sections.",
    });
  }

  if (metrics.imagesMissingAlt > 0) {
    warnings.push({
      id: "image-alt-missing",
      kind: "warn",
      message:
        metrics.imagesMissingAlt === 1
          ? "1 image is missing alt text."
          : `${metrics.imagesMissingAlt} images are missing alt text.`,
    });
  }

  const metaTitle = input.metaTitle?.trim() ?? "";
  if (metaTitle.length > META_TITLE_LENGTH_GUIDANCE) {
    warnings.push({
      id: "meta-title-long",
      kind: "info",
      message: `Meta title is ${metaTitle.length} characters (guidance: ${META_TITLE_LENGTH_GUIDANCE}).`,
    });
  }

  const metaDescription = input.metaDescription?.trim() ?? "";
  if (metaDescription.length > META_DESCRIPTION_LENGTH_GUIDANCE) {
    warnings.push({
      id: "meta-description-long",
      kind: "info",
      message: `Meta description is ${metaDescription.length} characters (guidance: ${META_DESCRIPTION_LENGTH_GUIDANCE}).`,
    });
  }

  const heroImage = input.heroImage.trim();
  const coverAlt = input.coverImageAlt?.trim() ?? "";
  if (heroImage.length > 0 && coverAlt.length === 0) {
    warnings.push({
      id: "hero-alt-missing",
      kind: "warn",
      message: "Cover image is set but hero alt text is empty.",
    });
  }

  const socialImage = input.socialImage?.trim() ?? "";
  if (heroImage.length === 0 && socialImage.length === 0) {
    warnings.push({
      id: "social-image-missing",
      kind: "info",
      message: "No hero or social image set for sharing previews.",
    });
  }

  if (
    metrics.wordCount >= LONG_ARTICLE_WORD_THRESHOLD &&
    outline.headings.length > 0 &&
    !outline.hasSubheading
  ) {
    warnings.push({
      id: "long-article-no-h2",
      kind: "info",
      message: `Article has ${metrics.wordCount} words but no H2 sections.`,
    });
  }

  if (
    metrics.wordCount > 0 &&
    metrics.wordCount < SHORT_BODY_WORD_THRESHOLD
  ) {
    warnings.push({
      id: "body-short",
      kind: "info",
      message: `Body is only ${metrics.wordCount} words.`,
    });
  }

  if (metrics.externalLinkCount > EXTERNAL_LINK_WARN_THRESHOLD) {
    warnings.push({
      id: "external-links-many",
      kind: "info",
      message: `Body has ${metrics.externalLinkCount} external links.`,
    });
  }

  const knownSlugs = new Set(
    (context.knownPostSlugs ?? []).map((slug) => slug.trim()).filter(Boolean),
  );
  const brokenLinks = findBrokenInternalLinks(input.body, knownSlugs);
  if (brokenLinks.length > 0) {
    warnings.push({
      id: "internal-links-broken",
      kind: "warn",
      message:
        brokenLinks.length === 1
          ? `Internal link may not match a loaded post: ${brokenLinks[0]}`
          : `${brokenLinks.length} internal links may not match loaded posts.`,
    });
  }

  if (input.body.trim().length === 0 && !issueFields.has("body")) {
    warnings.push({
      id: "body-empty",
      kind: "warn",
      message: "Body is empty.",
    });
  }

  return warnings;
}

export function analyzeContentQuality(
  input: ContentQualityInput,
  validationIssues: ValidationIssue[],
  context: ContentQualityContext = {},
): {
  metrics: ContentQualityMetrics;
  warnings: ContentQualityWarning[];
} {
  const metrics = buildContentQualityMetrics(input);
  const warnings = buildContentQualityWarnings(
    input,
    metrics,
    validationIssues,
    context,
  );

  return { metrics, warnings };
}
