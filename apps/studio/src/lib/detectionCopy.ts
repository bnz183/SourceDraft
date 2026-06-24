import { fieldLabel } from "./fieldLabels.js";
import type { SetupDetectionSuggestion } from "./setupDetection.js";

export type ConfidenceLevel = "high" | "medium" | "low";

export function friendlyConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 70) {
    return "high";
  }

  if (confidence >= 40) {
    return "medium";
  }

  return "low";
}

export function friendlyConfidenceLabel(confidence: number): string {
  switch (friendlyConfidenceLevel(confidence)) {
    case "high":
      return "High confidence";
    case "medium":
      return "Medium confidence";
    default:
      return "Low confidence";
  }
}

export function friendlySiteType(suggestion: SetupDetectionSuggestion): string {
  return suggestion.framework;
}

export function friendlyDetectionHeadline(
  suggestion: SetupDetectionSuggestion,
): string {
  const framework = suggestion.framework.trim();
  const article = /^[aeiou]/iu.test(framework) ? "an" : "a";
  return `We found ${article} ${framework} site`;
}

export function friendlyPostsLocation(
  suggestion: SetupDetectionSuggestion,
): string {
  if (suggestion.postFileCount > 0) {
    const noun = suggestion.postFileCount === 1 ? "article" : "articles";
    return `We found ${suggestion.postFileCount} ${noun} in ${suggestion.contentRoot}.`;
  }

  return `Your articles are expected in ${suggestion.contentRoot} (no sample articles found yet).`;
}

export function friendlyMediaLocation(
  suggestion: SetupDetectionSuggestion,
): string {
  return `Images and files live in ${suggestion.mediaDir} and appear on your site at ${suggestion.publicMediaPath}.`;
}

export function friendlySchemaSummary(
  suggestion: SetupDetectionSuggestion,
): string {
  const frontmatter = suggestion.frontmatter;
  if (!frontmatter || frontmatter.fields.length === 0) {
    return "We could not read fields from sample articles yet. SourceDraft will use standard fields like title, description, and date.";
  }

  const fields = frontmatter.fields
    .slice(0, 8)
    .map((field) => fieldLabel(field.universalField ?? field.key))
    .join(", ");

  const noun = frontmatter.postsSampled === 1 ? "article" : "articles";
  return `From ${frontmatter.postsSampled} sample ${noun}, common fields include: ${fields}.`;
}

export function friendlyWhyWeThinkSo(suggestion: SetupDetectionSuggestion): string {
  return suggestion.explanation;
}

export function adapterIdFromConfig(configAdapter: string): string {
  return configAdapter.trim().length > 0 ? configAdapter : "astro-mdx";
}

export function siteTypeFromConfig(
  configAdapter: string,
  detectedFramework: string | null,
): string {
  if (detectedFramework && detectedFramework.trim().length > 0) {
    return detectedFramework;
  }

  switch (configAdapter) {
    case "nextjs-mdx":
      return "Next.js";
    case "hugo-markdown":
      return "Hugo";
    case "eleventy-jekyll-markdown":
      return "Eleventy / Jekyll";
    case "docusaurus-mdx":
      return "Docusaurus";
    case "mkdocs-markdown":
      return "MkDocs";
    case "nuxt-content-markdown":
      return "Nuxt Content";
    case "markdown":
      return "Markdown";
    default:
      return "Astro";
  }
}
