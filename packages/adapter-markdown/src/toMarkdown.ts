import { appendSeoFrontmatterLines, type Article } from "@sourcedraft/core";

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

export function toMarkdown(article: Article): string {
  const frontmatter: string[] = [
    "---",
    `title: ${yamlScalar(article.title)}`,
    `description: ${yamlScalar(article.description)}`,
    `pubDate: ${yamlScalar(article.pubDate)}`,
  ];

  if (article.updatedDate !== undefined) {
    frontmatter.push(`updatedDate: ${yamlScalar(article.updatedDate)}`);
  }

  frontmatter.push(`category: ${yamlScalar(article.category)}`);
  frontmatter.push(...formatTags(article.tags));
  frontmatter.push(`draft: ${article.draft}`);

  if (article.heroImage !== undefined) {
    frontmatter.push(`heroImage: ${yamlScalar(article.heroImage)}`);
  }

  appendSeoFrontmatterLines(frontmatter, article, yamlScalar);
  frontmatter.push("---");

  return `${frontmatter.join("\n")}\n\n${article.body}`;
}
