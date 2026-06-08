import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Article } from "@sourcedraft/core";
import { getNextjsMdxPath } from "./path.js";
import { toNextjsMdx } from "./toNextjsMdx.js";

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
  author: "Ada Lovelace",
  metaTitle: "SEO Title",
  metaDescription: "SEO description",
  canonicalUrl: "https://example.com/hello-world",
  socialImage: "/images/social.png",
  body: "## Intro\n\nParagraph one.",
};

describe("toNextjsMdx", () => {
  it("renders YAML frontmatter with Next.js field names", () => {
    const output = toNextjsMdx(article);

    assert.match(output, /^---\n/);
    assert.match(output, /title: "Hello: World"\n/);
    assert.match(output, /description: "A post with special: chars"\n/);
    assert.match(output, /date: 2024-06-01\n/);
    assert.match(output, /updatedDate: 2024-06-02\n/);
    assert.match(output, /draft: true\n/);
    assert.match(output, /slug: hello-world\n/);
    assert.match(output, /category: Guides\n/);
    assert.match(output, /tags:\n  - alpha\n  - beta\n/);
    assert.match(output, /author: Ada Lovelace\n/);
    assert.match(output, /coverImage: \/images\/cover\.png\n/);
    assert.match(output, /metaTitle: SEO Title\n/);
    assert.match(output, /metaDescription: SEO description\n/);
    assert.match(output, /canonicalUrl: https:\/\/example\.com\/hello-world\n/);
    assert.match(output, /socialImage: \/images\/social\.png\n/);
    assert.match(output, /---\n\n## Intro\n\nParagraph one\.$/);
  });

  it("omits optional fields when absent", () => {
    const output = toNextjsMdx({
      ...article,
      updatedDate: undefined,
      heroImage: undefined,
      author: undefined,
      metaTitle: undefined,
      metaDescription: undefined,
      canonicalUrl: undefined,
      socialImage: undefined,
    });

    assert.doesNotMatch(output, /updatedDate:/);
    assert.doesNotMatch(output, /coverImage:/);
    assert.doesNotMatch(output, /author:/);
    assert.doesNotMatch(output, /metaTitle:/);
  });

  it("generates .mdx path under contentDir", () => {
    assert.equal(
      getNextjsMdxPath(article, { contentDir: "content/posts" }),
      "content/posts/hello-world.mdx",
    );
  });
});
