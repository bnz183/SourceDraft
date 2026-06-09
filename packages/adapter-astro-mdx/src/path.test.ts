import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Article } from "@sourcedraft/core";
import { getAstroMdxPath } from "./path.js";

const article: Article = {
  title: "Test",
  slug: "test-post",
  description: "Summary",
  pubDate: "2024-06-01",
  category: "Guides",
  tags: ["one"],
  draft: false,
  body: "Body",
};

describe("getAstroMdxPath", () => {
  it("builds a path under contentDir with .mdx extension", () => {
    assert.equal(
      getAstroMdxPath(article, { contentDir: "src/content/blog" }),
      "src/content/blog/test-post.mdx",
    );
  });

  it("strips trailing slashes from contentDir", () => {
    assert.equal(
      getAstroMdxPath(article, { contentDir: "content/blog/" }),
      "content/blog/test-post.mdx",
    );
  });

  it("supports a custom extension", () => {
    assert.equal(
      getAstroMdxPath(article, { contentDir: "posts", extension: "md" }),
      "posts/test-post.md",
    );
  });
});
