import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Article } from "@sourcedraft/core";
import { toMarkdown } from "./toMarkdown.js";

const article: Article = {
  title: "Plain Markdown",
  slug: "plain-markdown",
  description: "Summary text",
  pubDate: "2024-06-01",
  category: "Notes",
  tags: ["docs"],
  draft: false,
  body: "First paragraph.\n\nSecond paragraph.",
};

describe("toMarkdown", () => {
  it("renders YAML frontmatter and markdown body", () => {
    const output = toMarkdown(article);

    assert.match(output, /^---\n/);
    assert.match(output, /title: Plain Markdown\n/);
    assert.match(output, /pubDate: 2024-06-01\n/);
    assert.match(output, /category: Notes\n/);
    assert.match(output, /tags:\n  - docs\n/);
    assert.match(output, /draft: false\n/);
    assert.match(output, /---\n\nFirst paragraph\.\n\nSecond paragraph\.$/);
  });
});
