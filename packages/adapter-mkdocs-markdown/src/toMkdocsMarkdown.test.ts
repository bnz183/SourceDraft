import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Article } from "@sourcedraft/core";
import { buildMkdocsNavHint } from "./options.js";
import { getMkdocsMarkdownPath } from "./path.js";
import { toMkdocsMarkdown } from "./toMkdocsMarkdown.js";

const article: Article = {
  title: "Hello: World",
  slug: "hello-world",
  description: "A post with special: chars",
  pubDate: "2024-06-01",
  category: "Guides",
  tags: ["alpha", "beta"],
  draft: false,
  body: "## Intro\n\nParagraph one.",
  metaTitle: "SEO Title",
  canonicalUrl: "https://example.com/hello-world",
};

describe("toMkdocsMarkdown", () => {
  it("renders YAML frontmatter with MkDocs field names", () => {
    const output = toMkdocsMarkdown(article);

    assert.match(output, /^---\n/);
    assert.match(output, /title: "Hello: World"\n/);
    assert.match(output, /description: "A post with special: chars"\n/);
    assert.match(output, /date: 2024-06-01\n/);
    assert.match(output, /tags:\n  - alpha\n  - beta\n/);
    assert.match(output, /metaTitle: SEO Title\n/);
    assert.match(output, /canonicalUrl: https:\/\/example\.com\/hello-world\n/);
    assert.doesNotMatch(output, /draft:/);
  });

  it("omits SEO fields when absent", () => {
    const output = toMkdocsMarkdown({
      ...article,
      metaTitle: undefined,
      canonicalUrl: undefined,
    });

    assert.doesNotMatch(output, /metaTitle:/);
    assert.doesNotMatch(output, /canonicalUrl:/);
  });

  it("generates paths under docs with filename conventions", () => {
    assert.equal(
      getMkdocsMarkdownPath(article, { contentDir: "docs" }),
      "docs/hello-world.md",
    );
    assert.equal(
      getMkdocsMarkdownPath(article, {
        contentDir: "docs",
        adapterOptions: { filenameConvention: "date-slug" },
      }),
      "docs/2024-06-01-hello-world.md",
    );
  });

  it("builds nav hints for preview metadata", () => {
    assert.match(
      buildMkdocsNavHint("Hello", "docs/hello-world.md", undefined),
      /mkdocs\.yml nav manually/,
    );
    assert.match(
      buildMkdocsNavHint("Hello", "docs/hello-world.md", "Blog"),
      /under "Blog"/,
    );
  });
});
