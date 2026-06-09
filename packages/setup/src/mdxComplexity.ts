const MDX_IMPORT_LINE = /^import\s+/u;
const MDX_EXPORT_LINE = /^export\s+/u;
const MDX_TAG_LINE = /^<[A-Za-z][\w.-]*/u;

export function hasComplexMdx(body: string): boolean {
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      continue;
    }

    if (
      MDX_IMPORT_LINE.test(trimmed) ||
      MDX_EXPORT_LINE.test(trimmed) ||
      MDX_TAG_LINE.test(trimmed)
    ) {
      return true;
    }
  }

  return false;
}
