import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Article } from "@sourcedraft/core";
import { getNuxtContentMarkdownPath } from "./path.js";
import { toNuxtContentMarkdown } from "./toNuxtContentMarkdown.js";

const article: Article = {
  title: "Hello: World",
  slug: "hello-world",
  description: "A post with special: chars",
  pubDate: "2024-06-01",
  category: "Guides",
  tags: ["alpha", "beta"],
  draft: true,
  body: "## Intro\n\nParagraph one.",
  metaTitle: "SEO Title",
  socialImage: "/images/social.png",
};

describe("toNuxtContentMarkdown", () => {
  it("renders YAML frontmatter with Nuxt Content field names", () => {
    const output = toNuxtContentMarkdown(article, { navigation: true });

    assert.match(output, /^---\n/);
    assert.match(output, /title: "Hello: World"\n/);
    assert.match(output, /date: 2024-06-01\n/);
    assert.match(output, /draft: true\n/);
    assert.match(output, /navigation: true\n/);
    assert.match(output, /category: Guides\n/);
    assert.match(output, /metaTitle: SEO Title\n/);
    assert.match(output, /socialImage: \/images\/social\.png\n/);
  });

  it("uses custom navigation label when configured", () => {
    const output = toNuxtContentMarkdown(article, {
      navigation: "Sidebar label",
    });
    assert.match(output, /navigation: Sidebar label\n/);
  });

  it("defaults navigation to article title", () => {
    const output = toNuxtContentMarkdown(article);
    assert.match(output, /navigation: "Hello: World"\n/);
  });

  it("omits SEO fields when absent", () => {
    const output = toNuxtContentMarkdown({
      ...article,
      metaTitle: undefined,
      socialImage: undefined,
    });
    assert.doesNotMatch(output, /metaTitle:/);
    assert.doesNotMatch(output, /socialImage:/);
  });

  it("generates paths under content/blog", () => {
    assert.equal(
      getNuxtContentMarkdownPath(article, { contentDir: "content/blog" }),
      "content/blog/hello-world.md",
    );
    assert.equal(
      getNuxtContentMarkdownPath(article, {
        contentDir: "content/blog",
        adapterOptions: { filenameConvention: "index" },
      }),
      "content/blog/hello-world/index.md",
    );
  });
});
