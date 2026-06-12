import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bodyToEditorDoc,
  editorDocToBody,
  parseMarkdownSegment,
  serializeMarkdownNodes,
} from "./markdownRoundtrip.js";

describe("markdownRoundtrip", () => {
  it("parses headings", () => {
    const nodes = parseMarkdownSegment("# Title\n## Section\n### Sub");
    assert.equal(nodes[0]?.type, "heading");
    assert.equal(nodes[0]?.attrs?.level, 1);
    assert.equal(nodes[1]?.attrs?.level, 2);
    assert.equal(nodes[2]?.attrs?.level, 3);
  });

  it("round-trips bold, italic, and links", () => {
    const markdown = "Hello **bold** and *italic* with [a link](https://example.com).";
    const serialized = serializeMarkdownNodes(parseMarkdownSegment(markdown));
    assert.match(serialized, /\*\*bold\*\*/u);
    assert.match(serialized, /\*italic\*/u);
    assert.match(serialized, /\[a link\]\(https:\/\/example.com\)/u);
  });

  it("round-trips images with alt text", () => {
    const markdown = "![Diagram alt](/images/diagram.png)";
    const serialized = serializeMarkdownNodes(parseMarkdownSegment(markdown));
    assert.equal(serialized, "![Diagram alt](/images/diagram.png)");
  });

  it("round-trips fenced code blocks and blockquotes", () => {
    const markdown = "> Quote line\n\n```ts\nconst x = 1;\n```";
    const serialized = serializeMarkdownNodes(parseMarkdownSegment(markdown));
    assert.match(serialized, /^> Quote line$/mu);
    assert.match(serialized, /```ts/u);
    assert.match(serialized, /const x = 1;/u);
  });

  it("round-trips bullet and numbered lists", () => {
    const markdown = "- One\n- Two\n\n1. First\n2. Second";
    const serialized = serializeMarkdownNodes(parseMarkdownSegment(markdown));
    assert.match(serialized, /^- One$/mu);
    assert.match(serialized, /^1\. First$/mu);
  });

  it("round-trips horizontal rules", () => {
    const markdown = "Above\n\n---\n\nBelow";
    const serialized = serializeMarkdownNodes(parseMarkdownSegment(markdown));
    assert.match(serialized, /---/u);
  });

  it("preserves unknown MDX blocks through editor doc conversion", () => {
    const body = "## Intro\n\n<CustomComponent prop=\"x\" />\n\nTail paragraph.";
    const roundTripped = editorDocToBody(bodyToEditorDoc(body));
    assert.match(roundTripped, /<CustomComponent prop="x" \/>/u);
    assert.match(roundTripped, /## Intro/u);
    assert.match(roundTripped, /Tail paragraph/u);
  });

  it("keeps source-mode body exact for raw MDX-only content", () => {
    const body = "<Chart data={points} />\n";
    const roundTripped = editorDocToBody(bodyToEditorDoc(body));
    assert.equal(roundTripped.includes("<Chart data={points} />"), true);
  });

  it("parses headings through H6", () => {
    const nodes = parseMarkdownSegment("#### H4\n##### H5\n###### H6");
    assert.equal(nodes[0]?.attrs?.level, 4);
    assert.equal(nodes[1]?.attrs?.level, 5);
    assert.equal(nodes[2]?.attrs?.level, 6);
  });

  it("round-trips strikethrough, underline, and sub/superscript", () => {
    const markdown = "~~removed~~ <u>under</u> H<sub>2</sub>O and E=mc<sup>2</sup>";
    const serialized = serializeMarkdownNodes(parseMarkdownSegment(markdown));
    assert.match(serialized, /~~removed~~/u);
    assert.match(serialized, /<u>under<\/u>/u);
    assert.match(serialized, /<sub>2<\/sub>/u);
    assert.match(serialized, /<sup>2<\/sup>/u);
  });

  it("round-trips GFM tables", () => {
    const markdown = "| Name | Value |\n| --- | --- |\n| Alpha | 1 |\n| Beta | 2 |";
    const serialized = serializeMarkdownNodes(parseMarkdownSegment(markdown));
    assert.match(serialized, /^\| Name \| Value \|$/mu);
    assert.match(serialized, /^\| Alpha \| 1 \|$/mu);
    assert.match(serialized, /^\| Beta \| 2 \|$/mu);
  });

  it("round-trips centered paragraphs through HTML alignment", () => {
    const markdown = '<p style="text-align: center">Centered text</p>';
    const roundTripped = serializeMarkdownNodes(parseMarkdownSegment(markdown));
    assert.match(roundTripped, /text-align: center/u);
    assert.match(roundTripped, /Centered text/u);
  });

  it("round-trips attachment-style links", () => {
    const markdown = "[Quarterly report](/media/report.pdf)";
    const roundTripped = serializeMarkdownNodes(parseMarkdownSegment(markdown));
    assert.equal(roundTripped, "[Quarterly report](/media/report.pdf)");
  });
});
