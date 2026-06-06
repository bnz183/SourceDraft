import type { ArticleFormState } from "./articleForm";
import { parseTagsInput } from "./articleForm";

const YAML_NEEDS_QUOTES =
  /^$|^[\s#>|@[`%&*!?{[\]},]|:\s|[\n\r]|^['"]|['"]$|^(true|false|null|yes|no|on|off)$/iu;

function yamlScalar(value: string): string {
  if (!YAML_NEEDS_QUOTES.test(value)) {
    return value;
  }

  return `"${value
    .replace(/\\/gu, "\\\\")
    .replace(/"/gu, '\\"')
    .replace(/\n/gu, "\\n")
    .replace(/\r/gu, "\\r")
    .replace(/\t/gu, "\\t")}"`;
}

function formatTags(tags: string[]): string[] {
  if (tags.length === 0) {
    return ["tags: []"];
  }

  return ["tags:", ...tags.map((tag) => `  - ${yamlScalar(tag)}`)];
}

export function buildFrontmatterPreview(state: ArticleFormState): string {
  const tags = parseTagsInput(state.tags);
  const lines = [
    "---",
    `title: ${yamlScalar(state.title)}`,
    `description: ${yamlScalar(state.description)}`,
    `pubDate: ${yamlScalar(state.pubDate)}`,
  ];

  if (state.updatedDate.trim().length > 0) {
    lines.push(`updatedDate: ${yamlScalar(state.updatedDate)}`);
  }

  lines.push(`category: ${yamlScalar(state.category)}`);
  lines.push(...formatTags(tags));
  lines.push(`draft: ${state.draft}`);

  if (state.heroImage.trim().length > 0) {
    lines.push(`heroImage: ${yamlScalar(state.heroImage)}`);
  }

  lines.push("---");

  if (state.body.length > 0) {
    return `${lines.join("\n")}\n\n${state.body}`;
  }

  return lines.join("\n");
}
