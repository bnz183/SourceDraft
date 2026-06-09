function parseScalar(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed
      .slice(1, -1)
      .replace(/\\"/gu, '"')
      .replace(/\\n/gu, "\n")
      .replace(/\\r/gu, "\r")
      .replace(/\\t/gu, "\t");
  }

  return trimmed;
}

function isFrontmatterKey(value: string): boolean {
  if (value.length === 0) {
    return false;
  }

  for (const char of value) {
    const code = char.charCodeAt(0);
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;
    if (!isUpper && !isLower) {
      return false;
    }
  }

  return true;
}

function parseKeyValueLine(line: string): { key: string; value: string } | null {
  const colonIndex = line.indexOf(":");
  if (colonIndex <= 0) {
    return null;
  }

  const key = line.slice(0, colonIndex).trim();
  if (!isFrontmatterKey(key)) {
    return null;
  }

  let valueStart = colonIndex + 1;
  while (valueStart < line.length && line[valueStart] === " ") {
    valueStart += 1;
  }

  return {
    key,
    value: line.slice(valueStart),
  };
}

function parseYamlValue(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "";
  }

  if (trimmed === "true") {
    return true;
  }

  if (trimmed === "false") {
    return false;
  }

  if (trimmed === "null") {
    return null;
  }

  return parseScalar(trimmed);
}

export function parseFrontmatter(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yaml.split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";

    if (line.trim().length === 0 || line.trimStart().startsWith("#")) {
      index += 1;
      continue;
    }

    if (/^tags:\s*\[\]\s*$/u.test(line)) {
      result.tags = [];
      index += 1;
      continue;
    }

    if (/^tags:\s*$/u.test(line)) {
      const tags: string[] = [];
      index += 1;

      while (index < lines.length && /^\s+-\s+/u.test(lines[index] ?? "")) {
        const tagLine = lines[index] ?? "";
        tags.push(parseScalar(tagLine.replace(/^\s+-\s+/u, "")));
        index += 1;
      }

      result.tags = tags;
      continue;
    }

    const keyValue = parseKeyValueLine(line);
    if (keyValue !== null) {
      result[keyValue.key] = parseYamlValue(keyValue.value);
      index += 1;
      continue;
    }

    index += 1;
  }

  return result;
}

export function splitFrontmatter(
  content: string,
): { frontmatter: Record<string, unknown>; body: string } | null {
  if (!content.startsWith("---\n")) {
    return null;
  }

  const closingIndex = content.indexOf("\n---\n", 4);
  if (closingIndex === -1) {
    return null;
  }

  const yaml = content.slice(4, closingIndex);
  const body = content.slice(closingIndex + 5);

  return {
    frontmatter: parseFrontmatter(yaml),
    body,
  };
}
