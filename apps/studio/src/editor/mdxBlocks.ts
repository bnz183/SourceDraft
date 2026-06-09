export type BodySegment =
  | { type: "markdown"; content: string }
  | { type: "mdx"; content: string };

const MDX_IMPORT_LINE = /^import\s+/u;
const MDX_EXPORT_LINE = /^export\s+/u;
const MDX_TAG_LINE = /^<[A-Za-z][\w.-]*/u;

function isMdxBlockStart(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0) {
    return false;
  }

  return (
    MDX_IMPORT_LINE.test(trimmed) ||
    MDX_EXPORT_LINE.test(trimmed) ||
    MDX_TAG_LINE.test(trimmed)
  );
}

function tagNameFromLine(line: string): string | null {
  const match = line.trim().match(/^<([A-Za-z][\w.-]*)/u);
  return match?.[1] ?? null;
}

function collectMdxBlock(
  lines: string[],
  startIndex: number,
): { content: string; nextIndex: number } {
  const firstLine = lines[startIndex] ?? "";
  const tagName = tagNameFromLine(firstLine);
  const blockLines = [firstLine];
  let index = startIndex + 1;

  if (tagName && !firstLine.includes("/>")) {
    const closeTag = `</${tagName}>`;
    while (index < lines.length) {
      const line = lines[index] ?? "";
      blockLines.push(line);
      if (line.includes(closeTag) || line.trim().endsWith("/>")) {
        index += 1;
        break;
      }
      index += 1;
    }
  } else if (!tagName) {
    while (index < lines.length) {
      const line = lines[index] ?? "";
      if (line.trim().length === 0) {
        break;
      }
      blockLines.push(line);
      index += 1;
    }
  } else {
    index = startIndex + 1;
  }

  return {
    content: blockLines.join("\n"),
    nextIndex: index,
  };
}

export function splitMdxBlocks(body: string): BodySegment[] {
  if (body.length === 0) {
    return [{ type: "markdown", content: "" }];
  }

  const lines = body.split("\n");
  const segments: BodySegment[] = [];
  const markdownBuffer: string[] = [];
  let index = 0;

  function flushMarkdown(): void {
    if (markdownBuffer.length === 0) {
      return;
    }

    segments.push({
      type: "markdown",
      content: markdownBuffer.join("\n"),
    });
    markdownBuffer.length = 0;
  }

  while (index < lines.length) {
    const line = lines[index] ?? "";

    if (isMdxBlockStart(line)) {
      flushMarkdown();
      const block = collectMdxBlock(lines, index);
      segments.push({ type: "mdx", content: block.content });
      index = block.nextIndex;
      continue;
    }

    markdownBuffer.push(line);
    index += 1;
  }

  flushMarkdown();

  if (segments.length === 0) {
    return [{ type: "markdown", content: body }];
  }

  return segments;
}

export function joinMdxBlocks(segments: BodySegment[]): string {
  if (segments.length === 0) {
    return "";
  }

  return segments
    .map((segment) => segment.content)
    .join("\n\n")
    .replace(/\n{3,}/gu, "\n\n");
}
