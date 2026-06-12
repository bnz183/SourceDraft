import type { JSONContent } from "@tiptap/core";
import { splitMdxBlocks, joinMdxBlocks, type BodySegment } from "./mdxBlocks.js";

type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "strike"; value: string }
  | { type: "underline"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; text: string; href: string }
  | { type: "image"; alt: string; src: string };

function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let index = 0;

  while (index < text.length) {
    const imageMatch = text.slice(index).match(/^!\[([^\]]*)\]\(([^)]+)\)/u);
    if (imageMatch) {
      tokens.push({
        type: "image",
        alt: imageMatch[1] ?? "",
        src: imageMatch[2] ?? "",
      });
      index += imageMatch[0].length;
      continue;
    }

    const linkMatch = text.slice(index).match(/^\[([^\]]+)\]\(([^)]+)\)/u);
    if (linkMatch) {
      tokens.push({
        type: "link",
        text: linkMatch[1] ?? "",
        href: linkMatch[2] ?? "",
      });
      index += linkMatch[0].length;
      continue;
    }

    const codeMatch = text.slice(index).match(/^`([^`]+)`/u);
    if (codeMatch) {
      tokens.push({ type: "code", value: codeMatch[1] ?? "" });
      index += codeMatch[0].length;
      continue;
    }

    const boldMatch = text.slice(index).match(/^\*\*([^*]+)\*\*/u);
    if (boldMatch) {
      tokens.push({ type: "bold", value: boldMatch[1] ?? "" });
      index += boldMatch[0].length;
      continue;
    }

    const strikeMatch = text.slice(index).match(/^~~([^~]+)~~/u);
    if (strikeMatch) {
      tokens.push({ type: "strike", value: strikeMatch[1] ?? "" });
      index += strikeMatch[0].length;
      continue;
    }

    const underlineMatch = text.slice(index).match(/^<u>([^<]+)<\/u>/iu);
    if (underlineMatch) {
      tokens.push({ type: "underline", value: underlineMatch[1] ?? "" });
      index += underlineMatch[0].length;
      continue;
    }

    const italicMatch = text.slice(index).match(/^\*([^*]+)\*/u);
    if (italicMatch) {
      tokens.push({ type: "italic", value: italicMatch[1] ?? "" });
      index += italicMatch[0].length;
      continue;
    }

    let end = index + 1;
    while (end < text.length) {
      const char = text[end];
      if (char === "!" || char === "[" || char === "*" || char === "`") {
        break;
      }
      end += 1;
    }
    tokens.push({ type: "text", value: text.slice(index, end) });
    index = end;
  }

  return tokens;
}

function inlineTokensToMarks(tokens: InlineToken[]): JSONContent[] {
  const nodes: JSONContent[] = [];

  for (const token of tokens) {
    if (token.type === "text") {
      if (token.value.length > 0) {
        nodes.push({ type: "text", text: token.value });
      }
      continue;
    }

    if (token.type === "bold") {
      nodes.push({
        type: "text",
        text: token.value,
        marks: [{ type: "bold" }],
      });
      continue;
    }

    if (token.type === "italic") {
      nodes.push({
        type: "text",
        text: token.value,
        marks: [{ type: "italic" }],
      });
      continue;
    }

    if (token.type === "strike") {
      nodes.push({
        type: "text",
        text: token.value,
        marks: [{ type: "strike" }],
      });
      continue;
    }

    if (token.type === "underline") {
      nodes.push({
        type: "text",
        text: token.value,
        marks: [{ type: "underline" }],
      });
      continue;
    }

    if (token.type === "code") {
      nodes.push({
        type: "text",
        text: token.value,
        marks: [{ type: "code" }],
      });
      continue;
    }

    if (token.type === "link") {
      nodes.push({
        type: "text",
        text: token.text,
        marks: [{ type: "link", attrs: { href: token.href } }],
      });
      continue;
    }

    if (token.type === "image") {
      nodes.push({
        type: "image",
        attrs: { src: token.src, alt: token.alt, title: token.alt },
      });
    }
  }

  return nodes.length > 0 ? nodes : [{ type: "text", text: "" }];
}

function paragraphNode(text: string): JSONContent {
  return {
    type: "paragraph",
    content: inlineTokensToMarks(parseInline(text)),
  };
}

export function parseMarkdownSegment(markdown: string): JSONContent[] {
  const lines = markdown.split("\n");
  const nodes: JSONContent[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";

    if (line.trim().length === 0) {
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/u);
    if (headingMatch?.[1] && headingMatch[2]) {
      nodes.push({
        type: "heading",
        attrs: { level: headingMatch[1].length },
        content: inlineTokensToMarks(parseInline(headingMatch[2].trim())),
      });
      index += 1;
      continue;
    }

    if (/^---+\s*$/u.test(line.trim()) || /^\*\*\*+\s*$/u.test(line.trim())) {
      nodes.push({ type: "horizontalRule" });
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const fence = line.trim();
      const language = fence.slice(3).trim();
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !(lines[index] ?? "").startsWith("```")) {
        codeLines.push(lines[index] ?? "");
        index += 1;
      }
      if (index < lines.length) {
        index += 1;
      }
      nodes.push({
        type: "codeBlock",
        attrs: language.length > 0 ? { language } : {},
        content: [{ type: "text", text: codeLines.join("\n") }],
      });
      continue;
    }

    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (index < lines.length && (lines[index] ?? "").startsWith("> ")) {
        quoteLines.push((lines[index] ?? "").slice(2));
        index += 1;
      }
      nodes.push({
        type: "blockquote",
        content: quoteLines.map((quoteLine) => paragraphNode(quoteLine)),
      });
      continue;
    }

    if (/^[-*]\s+/u.test(line)) {
      const items: JSONContent[] = [];
      while (index < lines.length && /^[-*]\s+/u.test(lines[index] ?? "")) {
        const itemText = (lines[index] ?? "").replace(/^[-*]\s+/u, "");
        items.push({
          type: "listItem",
          content: [paragraphNode(itemText)],
        });
        index += 1;
      }
      nodes.push({ type: "bulletList", content: items });
      continue;
    }

    if (/^\d+\.\s+/u.test(line)) {
      const items: JSONContent[] = [];
      while (index < lines.length && /^\d+\.\s+/u.test(lines[index] ?? "")) {
        const itemText = (lines[index] ?? "").replace(/^\d+\.\s+/u, "");
        items.push({
          type: "listItem",
          content: [paragraphNode(itemText)],
        });
        index += 1;
      }
      nodes.push({ type: "orderedList", content: items });
      continue;
    }

    const imageOnly = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/u);
    if (imageOnly) {
      nodes.push({
        type: "paragraph",
        content: [
          {
            type: "image",
            attrs: {
              src: imageOnly[2] ?? "",
              alt: imageOnly[1] ?? "",
              title: imageOnly[1] ?? "",
            },
          },
        ],
      });
      index += 1;
      continue;
    }

    nodes.push(paragraphNode(line));
    index += 1;
  }

  return nodes.length > 0 ? nodes : [{ type: "paragraph" }];
}

function serializeInlineNode(node: JSONContent): string {
  if (node.type === "image") {
    const alt = String(node.attrs?.alt ?? "");
    const src = String(node.attrs?.src ?? "");
    return `![${alt}](${src})`;
  }

  const text = node.text ?? "";
  const marks = node.marks ?? [];
  let value = text;

  if (marks.some((mark) => mark.type === "code")) {
    return `\`${value}\``;
  }

  if (marks.some((mark) => mark.type === "bold")) {
    value = `**${value}**`;
  }

  if (marks.some((mark) => mark.type === "italic")) {
    value = `*${value}*`;
  }

  if (marks.some((mark) => mark.type === "strike")) {
    value = `~~${value}~~`;
  }

  if (marks.some((mark) => mark.type === "underline")) {
    value = `<u>${value}</u>`;
  }

  const linkMark = marks.find((mark) => mark.type === "link");
  if (linkMark?.attrs?.href) {
    value = `[${text}](${String(linkMark.attrs.href)})`;
  }

  return value;
}

function serializeBlockNode(node: JSONContent): string {
  if (node.type === "mdxRawBlock") {
    return String(node.attrs?.raw ?? "");
  }

  if (node.type === "horizontalRule") {
    return "---";
  }

  if (node.type === "heading") {
    const level = Number(node.attrs?.level ?? 1);
    const prefix = "#".repeat(Math.min(3, Math.max(1, level)));
    const text = (node.content ?? []).map(serializeInlineNode).join("");
    return `${prefix} ${text}`.trimEnd();
  }

  if (node.type === "blockquote") {
    return (node.content ?? [])
      .map((child) => serializeBlockNode(child))
      .filter((line) => line.length > 0)
      .map((line) => `> ${line}`)
      .join("\n");
  }

  if (node.type === "bulletList") {
    return (node.content ?? [])
      .map((item) => {
        const text = (item.content ?? [])
          .map((child) => serializeBlockNode(child))
          .join("\n");
        return `- ${text}`;
      })
      .join("\n");
  }

  if (node.type === "orderedList") {
    return (node.content ?? [])
      .map((item, itemIndex) => {
        const text = (item.content ?? [])
          .map((child) => serializeBlockNode(child))
          .join("\n");
        return `${itemIndex + 1}. ${text}`;
      })
      .join("\n");
  }

  if (node.type === "codeBlock") {
    const language = String(node.attrs?.language ?? "").trim();
    const code = (node.content ?? []).map((child) => child.text ?? "").join("");
    return `\`\`\`${language}\n${code}\n\`\`\``;
  }

  if (node.type === "paragraph") {
    return (node.content ?? []).map(serializeInlineNode).join("");
  }

  return "";
}

export function serializeMarkdownNodes(nodes: JSONContent[]): string {
  return nodes
    .map(serializeBlockNode)
    .filter((block) => block.length > 0)
    .join("\n\n");
}

export function bodyToEditorDoc(body: string): JSONContent {
  const segments = splitMdxBlocks(body);
  const content: JSONContent[] = [];

  for (const segment of segments) {
    if (segment.type === "mdx") {
      content.push({
        type: "mdxRawBlock",
        attrs: { raw: segment.content },
      });
      continue;
    }

    content.push(...parseMarkdownSegment(segment.content));
  }

  return {
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph" }],
  };
}

export function editorDocToBody(doc: JSONContent): string {
  const nodes = doc.content ?? [];
  const segments: BodySegment[] = [];
  let markdownBuffer: JSONContent[] = [];

  function flushMarkdown(): void {
    if (markdownBuffer.length === 0) {
      return;
    }

    segments.push({
      type: "markdown",
      content: serializeMarkdownNodes(markdownBuffer),
    });
    markdownBuffer = [];
  }

  for (const node of nodes) {
    if (node.type === "mdxRawBlock") {
      flushMarkdown();
      segments.push({
        type: "mdx",
        content: String(node.attrs?.raw ?? ""),
      });
      continue;
    }

    markdownBuffer.push(node);
  }

  flushMarkdown();
  return joinMdxBlocks(segments);
}
