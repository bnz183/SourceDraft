import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Article } from "@sourcedraft/core";
import { getDocusaurusMdxPath } from "./path.js";
import { toDocusaurusMdx } from "./toDocusaurusMdx.js";

const article: Article = {
  title: "Hello: World",
  slug: "hello-world",
  description: "A post with special: chars",
  pubDate: "2024-06-01",
  category: "Guides",
  tags: ["alpha", "beta"],
  draft: false,
  heroImage: "/images/cover.png",
  author: "Ada Lovelace",
  metaTitle: "SEO Title",
  metaDescription: "SEO description",
  canonicalUrl: "https://example.com/hello-world",
  socialImage: "/images/social.png",
  body: "## Intro\n\nParagraph one.",
};

describe("toDocusaurusMdx", () => {
  it("renders YAML frontmatter with Docusaurus field names", () => {
    const output = toDocusaurusMdx(article, { hideTableOfContents: true });

    assert.match(output, /^---\n/);
    assert.match(output, /title: "Hello: World"\n/);
    assert.match(output, /description: "A post with special: chars"\n/);
    assert.match(output, /slug: hello-world\n/);
    assert.match(output, /authors:\n  - Ada Lovelace\n/);
    assert.match(output, /tags:\n  - alpha\n  - beta\n/);
    assert.match(output, /image: \/images\/cover\.png\n/);
    assert.match(output, /metaTitle: SEO Title\n/);
    assert.match(output, /hide_table_of_contents: true\n/);
    assert.match(output, /---\n\n## Intro/);
  });

  it("omits optional fields when absent", () => {
    const output = toDocusaurusMdx({
      ...article,
      heroImage: undefined,
      author: undefined,
      metaTitle: undefined,
      metaDescription: undefined,
      canonicalUrl: undefined,
      socialImage: undefined,
    });

    assert.doesNotMatch(output, /image:/);
    assert.doesNotMatch(output, /authors:/);
    assert.doesNotMatch(output, /metaTitle:/);
    assert.doesNotMatch(output, /hide_table_of_contents:/);
  });

  it("generates paths with filename conventions", () => {
    assert.equal(
      getDocusaurusMdxPath(article, { contentDir: "blog" }),
      "blog/hello-world.mdx",
    );
    assert.equal(
      getDocusaurusMdxPath(article, {
        contentDir: "blog",
        adapterOptions: { filenameConvention: "date-slug" },
      }),
      "blog/2024-06-01-hello-world.mdx",
    );
    assert.equal(
      getDocusaurusMdxPath(article, {
        contentDir: "blog",
        adapterOptions: { filenameConvention: "index" },
      }),
      "blog/hello-world/index.mdx",
    );
  });
});
