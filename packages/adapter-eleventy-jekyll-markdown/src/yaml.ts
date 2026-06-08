const YAML_NEEDS_QUOTES =
  /^$|^[\s#>|@[`%&*!?{[\]},]|:\s|[\n\r]|^['"]|['"]$|^(true|false|null|yes|no|on|off)$/iu;

export function yamlScalar(value: string): string {
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

export function formatYamlTags(tags: string[]): string[] {
  if (tags.length === 0) {
    return ["tags: []"];
  }

  return ["tags:", ...tags.map((tag) => `  - ${yamlScalar(tag)}`)];
}
