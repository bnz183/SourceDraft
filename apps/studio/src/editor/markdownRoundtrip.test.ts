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
});
