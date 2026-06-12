import { DEFAULT_SOURCEDRAFT_CATEGORIES_CSV } from "@sourcedraft/config";
import type { SetupDetectionResult, SetupDetectionSuggestion } from "./detectSetup.js";
import type { InferredFrontmatterSchema } from "./inferFrontmatterSchema.js";

function adapterLabel(adapter: string): string {
  switch (adapter) {
    case "astro-mdx":
      return "Astro MDX";
    case "hugo-markdown":
      return "Hugo Markdown";
    case "nextjs-mdx":
      return "Next.js MDX";
    case "eleventy-jekyll-markdown":
      return "Eleventy / Jekyll Markdown";
    case "docusaurus-mdx":
      return "Docusaurus MDX";
    case "mkdocs-markdown":
      return "MkDocs Markdown";
    case "nuxt-content-markdown":
      return "Nuxt Content Markdown";
    case "markdown":
      return "Markdown";
    default:
      return adapter;
  }
}

function formatFieldHints(frontmatter: InferredFrontmatterSchema | null | undefined): string {
  if (!frontmatter || frontmatter.fields.length === 0) {
    return "We could not read frontmatter from sample posts yet — add a draft with title, date, and tags to train your automation workflow.";
  }

  const topFields = frontmatter.fields
    .slice(0, 6)
    .map((field) => {
      if (field.universalField && field.universalField !== field.key) {
        return `${field.key} → ${field.universalField}`;
      }

      return field.key;
    })
    .join(", ");

  return `From ${frontmatter.postsSampled} sample post(s), common frontmatter fields include: ${topFields}. Studio maps these for AI-assisted and automated publishing workflows.`;
}

export function buildOnboardingMessage(
  result: SetupDetectionResult,
  suggestion: SetupDetectionSuggestion,
): string {
  const framework = suggestion.framework;
  const adapter = adapterLabel(suggestion.adapter);
  const postsLine =
    suggestion.postFileCount > 0
      ? `We found ${suggestion.postFileCount} post file(s) in \`${suggestion.contentDir}\` — ready for git-backed publish pipelines and CMS automation.`
      : `Posts are expected in \`${suggestion.contentDir}\` (no sample posts found yet). Add content to wire up deploy hooks and workflow tooling.`;

  const categoriesLine =
    suggestion.frontmatter?.suggestedCategories &&
    suggestion.frontmatter.suggestedCategories.length > 0
      ? `Suggested categories from your content: ${suggestion.frontmatter.suggestedCategories.join(", ")}.`
      : `Default categories cover ${DEFAULT_SOURCEDRAFT_CATEGORIES_CSV}.`;

  return [
    `We found a ${framework} project at \`${result.scannedRoot}\` suited to AI-assisted publishing.`,
    postsLine,
    `We recommend the ${adapter} adapter for Markdown/MDX output compatible with automation tools and static deploy workflows.`,
    formatFieldHints(suggestion.frontmatter),
    categoriesLine,
    "Click Generate config to create sourcedraft.config.json with these values, or adjust them first.",
  ].join(" ");
}

export function buildOnboardingFailureMessage(result: SetupDetectionResult): string {
  if (result.warnings.length > 0) {
    return [
      "SourceDraft could not confidently detect your publishing stack.",
      result.warnings.join(" "),
      "You can still run pnpm setup, point SourceDraft at a Hugo/Astro/Next.js repo manually, or edit sourcedraft.config.json for a custom automation workflow.",
    ].join(" ");
  }

  return "SourceDraft could not detect a supported framework for git-backed publishing. Run pnpm setup or configure sourcedraft.config.json manually for your CMS and automation toolchain.";
}

export function buildConfigWriteSummary(
  configPath: string,
  config: Record<string, unknown>,
): string {
  const categories = Array.isArray(config.categories)
    ? (config.categories as string[]).join(", ")
    : "";

  return [
    `Will write ${configPath} with:`,
    `adapter: ${String(config.adapter ?? "")}`,
    `contentDir: ${String(config.contentDir ?? "")}`,
    `mediaDir: ${String(config.mediaDir ?? "")}`,
    `defaultBranch: ${String(config.defaultBranch ?? "")}`,
    categories.length > 0 ? `categories: ${categories}` : "",
    "publisher: github (edit in .env via pnpm setup for GitLab, WordPress, or Ghost)",
  ]
    .filter((line) => line.length > 0)
    .join("\n");
}
