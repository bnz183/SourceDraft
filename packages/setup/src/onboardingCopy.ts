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
    return "We could not read frontmatter from sample posts yet.";
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

  return `From ${frontmatter.postsSampled} sample post(s), common frontmatter fields include: ${topFields}.`;
}

export function buildOnboardingMessage(
  result: SetupDetectionResult,
  suggestion: SetupDetectionSuggestion,
): string {
  const framework = suggestion.framework;
  const adapter = adapterLabel(suggestion.adapter);
  const postsLine =
    suggestion.postFileCount > 0
      ? `We found ${suggestion.postFileCount} post file(s) in \`${suggestion.contentDir}\`.`
      : `Posts are expected in \`${suggestion.contentDir}\` (no sample posts found yet).`;

  return [
    `We found a ${framework} project at \`${result.scannedRoot}\`.`,
    postsLine,
    `We recommend the ${adapter} adapter.`,
    formatFieldHints(suggestion.frontmatter),
    "Click Generate config to create sourcedraft.config.json with these values, or adjust them first.",
  ].join(" ");
}

export function buildOnboardingFailureMessage(result: SetupDetectionResult): string {
  if (result.warnings.length > 0) {
    return [
      "SourceDraft could not confidently detect your site setup.",
      result.warnings.join(" "),
      "You can still run pnpm setup or edit sourcedraft.config.json manually.",
    ].join(" ");
  }

  return "SourceDraft could not detect a supported framework. Run pnpm setup or configure sourcedraft.config.json manually.";
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
  ]
    .filter((line) => line.length > 0)
    .join("\n");
}
