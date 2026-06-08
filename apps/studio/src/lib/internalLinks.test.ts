import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PostSummary } from "./posts.js";
import {
  buildInternalLinkMarkdown,
  filterPostsForInternalLink,
  insertInternalLinkMarkdown,
  internalLinkHref,
} from "./internalLinks.js";

const posts: PostSummary[] = [
  {
    path: "src/content/blog/alpha.mdx",
    title: "Alpha Post",
    slug: "alpha-post",
    pubDate: "2026-01-01",
    category: "Guides",
    draft: false,
  },
  {
    path: "src/content/blog/beta.mdx",
    title: "Beta Guide",
    slug: "beta-guide",
    pubDate: "2026-02-01",
    category: "Notes",
    draft: true,
  },
];

describe("internal links", () => {
  it("builds slug-based root-relative hrefs", () => {
    assert.equal(internalLinkHref("alpha-post"), "/alpha-post");
    assert.equal(internalLinkHref("/beta-guide/"), "/beta-guide");
  });

  it("inserts markdown link syntax", () => {
    const markdown = buildInternalLinkMarkdown({
      title: "Alpha Post",
      slug: "alpha-post",
    });
    assert.equal(markdown, "[Alpha Post](/alpha-post)");

    const result = insertInternalLinkMarkdown(
      "See also: ",
      { start: 10, end: 10 },
      { title: "Beta Guide", slug: "beta-guide" },
    );
    assert.equal(result.value, "See also: [Beta Guide](/beta-guide)");
  });

  it("filters posts for internal link search", () => {
    const filtered = filterPostsForInternalLink(posts, "beta", posts[0]?.path);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.slug, "beta-guide");
  });
});
