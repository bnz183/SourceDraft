import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PostSummary } from "./posts.js";
import {
  extractCategoriesFromPosts,
  filterAndSortPosts,
  matchesPostSearch,
} from "./postListFilters.js";

const samplePosts: PostSummary[] = [
  {
    path: "src/content/blog/alpha.mdx",
    title: "Alpha Post",
    slug: "alpha-post",
    pubDate: "2026-01-10",
    category: "Guides",
    draft: false,
  },
  {
    path: "src/content/blog/beta-draft.mdx",
    title: "Beta Draft",
    slug: "beta-draft",
    pubDate: "2026-02-01",
    category: "News",
    draft: true,
  },
  {
    path: "src/content/blog/gamma.mdx",
    title: "Gamma Guide",
    slug: "gamma-guide",
    pubDate: "2025-12-20",
    category: "Guides",
    draft: false,
  },
];

describe("post list filters", () => {
  it("matches search across title, slug, path, and category", () => {
    assert.equal(matchesPostSearch(samplePosts[0]!, "alpha"), true);
    assert.equal(matchesPostSearch(samplePosts[0]!, "beta-post"), false);
    assert.equal(matchesPostSearch(samplePosts[1]!, "news"), true);
    assert.equal(matchesPostSearch(samplePosts[2]!, "gamma-guide"), true);
  });

  it("extracts sorted categories from posts", () => {
    assert.deepEqual(extractCategoriesFromPosts(samplePosts), ["Guides", "News"]);
  });

  it("filters by draft status and category", () => {
    const drafts = filterAndSortPosts(samplePosts, {
      search: "",
      draft: "draft",
      category: "",
      sort: "title-asc",
    });
    assert.equal(drafts.length, 1);
    assert.equal(drafts[0]?.title, "Beta Draft");

    const guides = filterAndSortPosts(samplePosts, {
      search: "",
      draft: "all",
      category: "Guides",
      sort: "title-asc",
    });
    assert.equal(guides.length, 2);
  });

  it("sorts posts by publish date, title, and path", () => {
    const byDate = filterAndSortPosts(samplePosts, {
      search: "",
      draft: "all",
      category: "",
      sort: "pubDate-desc",
    });
    assert.deepEqual(
      byDate.map((post) => post.slug),
      ["beta-draft", "alpha-post", "gamma-guide"],
    );

    const byTitle = filterAndSortPosts(samplePosts, {
      search: "",
      draft: "all",
      category: "",
      sort: "title-asc",
    });
    assert.deepEqual(
      byTitle.map((post) => post.slug),
      ["alpha-post", "beta-draft", "gamma-guide"],
    );
  });
});
