export type HugoFrontmatterFormat = "yaml" | "toml";

export type HugoMarkdownOptions = {
  frontmatterFormat?: HugoFrontmatterFormat;
};

export function resolveHugoOptions(
  options?: Record<string, unknown>,
): HugoMarkdownOptions {
  const format = options?.frontmatterFormat;
  if (format === "toml") {
    return { frontmatterFormat: "toml" };
  }

  return { frontmatterFormat: "yaml" };
}
