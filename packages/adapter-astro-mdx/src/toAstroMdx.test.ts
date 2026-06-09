import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Article } from "@sourcedraft/core";
import { toAstroMdx } from "./toAstroMdx.js";

const article: Article = {
  title: "Hello: World",
  slug: "hello-world",
  description: "A post with special: chars",
  pubDate: "2024-06-01",
  updatedDate: "2024-06-02",
  category: "Guides",
  tags: ["alpha", "beta"],
  draft: true,
  heroImage: "/images/hero.png",
  metaTitle: "SEO title",
  coverImageAlt: "Cover alt",
  noindex: true,
  body: "## Intro\n\nParagraph one.",
};

describe("toAstroMdx", () => {
  it("renders YAML frontmatter and body", () => {
    const output = toAstroMdx(article);

    assert.match(output, /^---\n/);
    assert.match(output, /title: "Hello: World"\n/);
    assert.match(output, /description: "A post with special: chars"\n/);
    assert.match(output, /pubDate: 2024-06-01\n/);
    assert.match(output, /updatedDate: 2024-06-02\n/);
    assert.match(output, /category: Guides\n/);
    assert.match(output, /tags:\n  - alpha\n  - beta\n/);
    assert.match(output, /draft: true\n/);
    assert.match(output, /heroImage: \/images\/hero\.png\n/);
    assert.match(output, /metaTitle: SEO title\n/);
    assert.match(output, /coverImageAlt: Cover alt\n/);
    assert.match(output, /noindex: true\n/);
    assert.match(output, /readingTime: 1\n/);
    assert.match(output, /---\n\n## Intro\n\nParagraph one\.$/);
  });

  it("renders empty tags as an empty YAML array", () => {
    const output = toAstroMdx({ ...article, tags: [] });
    assert.match(output, /tags: \[\]\n/);
  });

  it("omits optional frontmatter fields when absent", () => {
    const output = toAstroMdx({
      ...article,
      updatedDate: undefined,
      heroImage: undefined,
    });

    assert.doesNotMatch(output, /updatedDate:/);
    assert.doesNotMatch(output, /heroImage:/);
  });
});
