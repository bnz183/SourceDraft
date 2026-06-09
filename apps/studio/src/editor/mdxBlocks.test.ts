import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { joinMdxBlocks, splitMdxBlocks } from "./mdxBlocks.js";

describe("mdxBlocks", () => {
  it("preserves unknown MDX JSX blocks verbatim", () => {
    const body = "# Title\n\n<Callout type=\"note\">\nCustom content\n</Callout>\n\nParagraph after.";
    const segments = splitMdxBlocks(body);
    assert.equal(segments.length, 3);
    assert.equal(segments[0]?.type, "markdown");
    assert.equal(segments[1]?.type, "mdx");
    if (segments[1]?.type === "mdx") {
      assert.match(segments[1].content, /<Callout/u);
      assert.match(segments[1].content, /Custom content/u);
    }
  });

  it("detects import lines as MDX blocks", () => {
    const body = "import Chart from './Chart.mdx'\n\n## Section";
    const segments = splitMdxBlocks(body);
    assert.equal(segments[0]?.type, "mdx");
    assert.equal(segments[1]?.type, "markdown");
  });

  it("joins segments back into body text", () => {
    const body = "Intro\n\n<Widget />\n\nOutro";
    const joined = joinMdxBlocks(splitMdxBlocks(body));
    assert.match(joined, /<Widget \/>/u);
    assert.match(joined, /Intro/u);
    assert.match(joined, /Outro/u);
  });
});
