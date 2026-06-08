export type TextSelection = {
  start: number;
  end: number;
};

export type ApplyResult = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

export type MarkdownAction =
  | "h1"
  | "h2"
  | "h3"
  | "bold"
  | "italic"
  | "link"
  | "bullet-list"
  | "numbered-list"
  | "blockquote"
  | "inline-code"
  | "code-block"
  | "image";

export type ApplyMarkdownOptions = {
  imagePath?: string;
  imageAlt?: string;
};

const HEADING_PREFIX: Record<"h1" | "h2" | "h3", string> = {
  h1: "# ",
  h2: "## ",
  h3: "### ",
};

function lineBounds(text: string, index: number): { start: number; end: number } {
  const before = text.lastIndexOf("\n", index - 1);
  const start = before === -1 ? 0 : before + 1;
  const after = text.indexOf("\n", index);
  const end = after === -1 ? text.length : after;
  return { start, end };
}

function selectionLineRange(
  text: string,
  selection: TextSelection,
): { start: number; end: number } {
  const startLine = lineBounds(text, selection.start);
  const endLine = lineBounds(text, Math.max(selection.end - 1, selection.start));
  return { start: startLine.start, end: endLine.end };
}

function wrapSelection(
  text: string,
  selection: TextSelection,
  before: string,
  after: string,
  placeholder: string,
): ApplyResult {
  const selected = text.slice(selection.start, selection.end);
  const content = selected.length > 0 ? selected : placeholder;
  const value =
    text.slice(0, selection.start) +
    before +
    content +
    after +
    text.slice(selection.end);
  const selectionStart = selection.start + before.length;
  const selectionEnd = selectionStart + content.length;

  return { value, selectionStart, selectionEnd };
}

function stripHeadingPrefix(line: string): string {
  return line.replace(/^#{1,6}\s+/, "");
}

function applyLinePrefix(
  text: string,
  selection: TextSelection,
  buildPrefix: (lineIndex: number, line: string) => string,
  emptyPlaceholder: string,
): ApplyResult {
  const range = selectionLineRange(text, selection);
  const block = text.slice(range.start, range.end);

  if (block.length === 0) {
    const prefix = buildPrefix(0, emptyPlaceholder);
    const insertion = `${prefix}${emptyPlaceholder}`;
    const value =
      text.slice(0, selection.start) + insertion + text.slice(selection.end);
    const selectionStart = selection.start + prefix.length;
    const selectionEnd = selectionStart + emptyPlaceholder.length;
    return { value, selectionStart, selectionEnd };
  }

  const lines = block.split("\n");
  const nextLines = lines.map((line, index) => {
    const trimmed = line.trimEnd();
    const prefix = buildPrefix(index, trimmed);
    if (trimmed.length === 0) {
      return prefix.trimEnd();
    }
    return `${prefix}${stripHeadingPrefix(trimmed)}`;
  });

  const nextBlock = nextLines.join("\n");
  const value = text.slice(0, range.start) + nextBlock + text.slice(range.end);
  const selectionStart = range.start;
  const selectionEnd = range.start + nextBlock.length;

  return { value, selectionStart, selectionEnd };
}

function applyHeading(
  text: string,
  selection: TextSelection,
  level: 1 | 2 | 3,
): ApplyResult {
  const prefix = HEADING_PREFIX[`h${level}` as "h1" | "h2" | "h3"];
  return applyLinePrefix(text, selection, () => prefix, "Heading");
}

function applyBlockquote(text: string, selection: TextSelection): ApplyResult {
  return applyLinePrefix(text, selection, () => "> ", "Quote");
}

function applyBulletList(text: string, selection: TextSelection): ApplyResult {
  return applyLinePrefix(text, selection, () => "- ", "List item");
}

function applyNumberedList(text: string, selection: TextSelection): ApplyResult {
  return applyLinePrefix(
    text,
    selection,
    (index) => `${index + 1}. `,
    "List item",
  );
}

function applyCodeBlock(text: string, selection: TextSelection): ApplyResult {
  const selected = text.slice(selection.start, selection.end);
  const content = selected.length > 0 ? selected : "code";
  const fence = "```";
  const wrapped = `${fence}\n${content}\n${fence}`;
  const value =
    text.slice(0, selection.start) + wrapped + text.slice(selection.end);
  const selectionStart = selection.start + fence.length + 1;
  const selectionEnd = selectionStart + content.length;
  return { value, selectionStart, selectionEnd };
}

function applyImage(
  text: string,
  selection: TextSelection,
  imagePath: string,
  imageAlt: string,
): ApplyResult {
  const alt =
    selection.start !== selection.end
      ? text.slice(selection.start, selection.end)
      : imageAlt;
  const snippet = `![${alt}](${imagePath})`;
  const value =
    text.slice(0, selection.start) + snippet + text.slice(selection.end);
  const selectionStart = selection.start;
  const selectionEnd = selectionStart + snippet.length;
  return { value, selectionStart, selectionEnd };
}

export function applyMarkdownAction(
  text: string,
  selection: TextSelection,
  action: MarkdownAction,
  options: ApplyMarkdownOptions = {},
): ApplyResult {
  switch (action) {
    case "h1":
      return applyHeading(text, selection, 1);
    case "h2":
      return applyHeading(text, selection, 2);
    case "h3":
      return applyHeading(text, selection, 3);
    case "bold":
      return wrapSelection(text, selection, "**", "**", "bold text");
    case "italic":
      return wrapSelection(text, selection, "*", "*", "italic text");
    case "link":
      return wrapSelection(text, selection, "[", "](https://)", "link text");
    case "bullet-list":
      return applyBulletList(text, selection);
    case "numbered-list":
      return applyNumberedList(text, selection);
    case "blockquote":
      return applyBlockquote(text, selection);
    case "inline-code":
      return wrapSelection(text, selection, "`", "`", "code");
    case "code-block":
      return applyCodeBlock(text, selection);
    case "image": {
      const path = options.imagePath?.trim() ?? "";
      if (path.length === 0) {
        throw new Error("Image path is required");
      }
      return applyImage(
        text,
        selection,
        path,
        options.imageAlt?.trim() || "Image",
      );
    }
  }
}

export function selectionFromTextarea(
  textarea: HTMLTextAreaElement,
): TextSelection {
  return {
    start: textarea.selectionStart,
    end: textarea.selectionEnd,
  };
}

export function applyResultToTextarea(
  textarea: HTMLTextAreaElement,
  result: ApplyResult,
): void {
  textarea.focus();
  textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
}

export function actionForShortcut(key: string): MarkdownAction | null {
  const lower = key.toLowerCase();
  if (lower === "b") {
    return "bold";
  }
  if (lower === "i") {
    return "italic";
  }
  if (lower === "k") {
    return "link";
  }
  return null;
}
