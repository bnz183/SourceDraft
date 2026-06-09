import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Article } from "@sourcedraft/core";
import { getHugoMarkdownPath } from "./path.js";
import { toHugoMarkdown } from "./toHugoMarkdown.js";

const article: Article = {
  title: "Hello: World",
  slug: "hello-world",
  description: "A post with special: chars",
  pubDate: "2024-06-01",
  updatedDate: "2024-06-02",
  category: "Guides",
  tags: ["alpha", "beta"],
  draft: true,
  heroImage: "/images/cover.png",
  metaTitle: "SEO Title",
  metaDescription: "SEO description",
  canonicalUrl: "https://example.com/hello-world",
  socialImage: "/images/social.png",
  body: "## Intro\n\nParagraph one.",
};

describe("toHugoMarkdown", () => {
  it("renders YAML frontmatter with Hugo field names", () => {
    const output = toHugoMarkdown(article);

    assert.match(output, /^---\n/);
    assert.match(output, /date: 2024-06-01\n/);
    assert.match(output, /lastmod: 2024-06-02\n/);
    assert.match(output, /draft: true\n/);
    assert.match(output, /slug: hello-world\n/);
    assert.match(output, /categories:\n  - Guides\n/);
    assert.match(output, /tags:\n  - alpha\n  - beta\n/);
    assert.match(output, /images:\n  - \/images\/cover\.png\n/);
    assert.match(output, /metaTitle: SEO Title\n/);
    assert.match(output, /canonicalUrl: https:\/\/example\.com\/hello-world\n/);
  });

  it("renders TOML frontmatter when configured", () => {
    const output = toHugoMarkdown(article, { frontmatterFormat: "toml" });

    assert.match(output, /^\+\+\+\n/);
    assert.match(output, /title = "Hello: World"\n/);
    assert.match(output, /date = "2024-06-01"\n/);
    assert.match(output, /categories = \["Guides"\]\n/);
    assert.match(output, /tags = \["alpha", "beta"\]\n/);
    assert.match(output, /images = \["\/images\/cover\.png"\]\n/);
    assert.match(output, /\+\+\+\n\n## Intro/);
  });

  it("omits draft false handling and optional fields", () => {
    const output = toHugoMarkdown({
      ...article,
      draft: false,
      updatedDate: undefined,
      heroImage: undefined,
      metaTitle: undefined,
    });

    assert.match(output, /draft: false\n/);
    assert.doesNotMatch(output, /lastmod:/);
    assert.doesNotMatch(output, /images:/);
  });

  it("generates .md path under contentDir", () => {
    assert.equal(
      getHugoMarkdownPath(article, { contentDir: "content/posts" }),
      "content/posts/hello-world.md",
    );
  });
});
