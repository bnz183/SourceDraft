export type DocumentHeading = {
  level: 1 | 2 | 3;
  text: string;
  lineIndex: number;
  startOffset: number;
};

export type DocumentOutlineAnalysis = {
  headings: DocumentHeading[];
  h1Count: number;
  hasSubheading: boolean;
};

const ATX_HEADING_LINE = /^(#{1,3})\s+(.+?)\s*$/u;

export function extractDocumentHeadings(body: string): DocumentHeading[] {
  const lines = body.split("\n");
  const headings: DocumentHeading[] = [];
  let offset = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex] ?? "";
    const match = line.match(ATX_HEADING_LINE);

    if (match?.[1] && match[2]) {
      const level = match[1].length;
      if (level >= 1 && level <= 3) {
        headings.push({
          level: level as 1 | 2 | 3,
          text: match[2].trim(),
          lineIndex,
          startOffset: offset,
        });
      }
    }

    offset += line.length + 1;
  }

  return headings;
}

export function analyzeDocumentOutline(body: string): DocumentOutlineAnalysis {
  const headings = extractDocumentHeadings(body);

  return {
    headings,
    h1Count: headings.filter((heading) => heading.level === 1).length,
    hasSubheading: headings.some((heading) => heading.level >= 2),
  };
}

export function scrollTextareaToOffset(
  textarea: HTMLTextAreaElement,
  offset: number,
): void {
  textarea.focus();
  textarea.setSelectionRange(offset, offset);

  const textBefore = textarea.value.slice(0, offset);
  const lineCount = textBefore.length === 0 ? 1 : textBefore.split("\n").length;
  const styles = window.getComputedStyle(textarea);
  const lineHeight = Number.parseFloat(styles.lineHeight) || 28;
  const targetTop = Math.max(0, (lineCount - 1) * lineHeight - textarea.clientHeight / 3);
  textarea.scrollTop = targetTop;
}
