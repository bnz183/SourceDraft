import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Article } from "@sourcedraft/core";
import { getEleventyJekyllMarkdownPath } from "./path.js";
import { toEleventyJekyllMarkdown } from "./toEleventyJekyllMarkdown.js";

const article: Article = {
  title: "Hello: World",
  slug: "hello-world",
  description: "A post with special: chars",
  pubDate: "2024-06-01",
  category: "Guides",
  tags: ["alpha", "beta"],
  draft: true,
  metaTitle: "SEO Title",
  metaDescription: "SEO description",
  canonicalUrl: "https://example.com/hello-world",
  socialImage: "/images/social.png",
  body: "## Intro\n\nParagraph one.",
};

describe("toEleventyJekyllMarkdown", () => {
  it("renders YAML frontmatter with layout and permalink", () => {
    const output = toEleventyJekyllMarkdown(article, { layout: "layouts/post" });

    assert.match(output, /^---\n/);
    assert.match(output, /date: 2024-06-01\n/);
    assert.match(output, /permalink: \/hello-world\/\n/);
    assert.match(output, /layout: layouts\/post\n/);
    assert.match(output, /category: Guides\n/);
    assert.match(output, /draft: true\n/);
    assert.match(output, /metaTitle: SEO Title\n/);
    assert.match(output, /socialImage: \/images\/social\.png\n/);
  });

  it("uses default layout when adapter option is missing", () => {
    const output = toEleventyJekyllMarkdown(article);
    assert.match(output, /layout: post\n/);
  });

  it("generates slug-based path by default", () => {
    assert.equal(
      getEleventyJekyllMarkdownPath(article, { contentDir: "src/posts" }),
      "src/posts/hello-world.md",
    );
  });

  it("generates Jekyll date-prefixed filename when enabled", () => {
    assert.equal(
      getEleventyJekyllMarkdownPath(article, {
        contentDir: "_posts",
        adapterOptions: { jekyllFilename: true },
      }),
      "_posts/2024-06-01-hello-world.md",
    );
  });
});
