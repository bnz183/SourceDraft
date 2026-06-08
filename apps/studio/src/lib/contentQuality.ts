import type { ValidationIssue } from "@sourcedraft/core";

export type ContentQualityInput = {
  title: string;
  description: string;
  body: string;
  heroImage: string;
};

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
const TITLE_LENGTH_GUIDANCE = 60;
const DESCRIPTION_LENGTH_GUIDANCE = 160;

const MARKDOWN_LINK_PATTERN =
  /(?<!!)\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/gu;

const MARKDOWN_IMAGE_PATTERN =
  /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/gu;

const ATX_HEADING_PATTERN = /^#{1,6}\s+\S/m;

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
  return ATX_HEADING_PATTERN.test(body);
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

export function buildContentQualityWarnings(
  input: ContentQualityInput,
  metrics: ContentQualityMetrics,
  validationIssues: ValidationIssue[],
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
): {
  metrics: ContentQualityMetrics;
  warnings: ContentQualityWarning[];
} {
  const metrics = buildContentQualityMetrics(input);
  const warnings = buildContentQualityWarnings(input, metrics, validationIssues);

  return { metrics, warnings };
}
