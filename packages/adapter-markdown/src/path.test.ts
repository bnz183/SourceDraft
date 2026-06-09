import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Article } from "@sourcedraft/core";
import { getMarkdownPath } from "./path.js";

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

describe("getMarkdownPath", () => {
  it("builds a path under contentDir with .md extension", () => {
    assert.equal(
      getMarkdownPath(article, { contentDir: "content/posts" }),
      "content/posts/test-post.md",
    );
  });

  it("supports a custom extension", () => {
    assert.equal(
      getMarkdownPath(article, { contentDir: "posts", extension: "markdown" }),
      "posts/test-post.markdown",
    );
  });
});
