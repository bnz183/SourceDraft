import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ArticleInput } from "./article.js";
import { normalizeArticle, validateArticle } from "./validation.js";

const validInput: ArticleInput = {
  title: "Test Post",
  slug: "test-post",
  description: "A short summary.",
  pubDate: "2024-06-01",
  category: "Guides",
  tags: ["alpha", "beta"],
  draft: false,
  body: "Hello **world**.",
};

describe("validateArticle", () => {
  it("accepts a valid article", () => {
    const result = validateArticle(validInput);
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
  });

  it("reports missing required fields", () => {
    const result = validateArticle({});
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((issue) => issue.field === "title"));
    assert.ok(result.issues.some((issue) => issue.field === "body"));
  });

  it("rejects invalid slug format", () => {
    const result = validateArticle({ ...validInput, slug: "Bad Slug" });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((issue) => issue.field === "slug"));
  });

  it("rejects invalid publication date", () => {
    const result = validateArticle({ ...validInput, pubDate: "not-a-date" });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((issue) => issue.field === "pubDate"));
  });

  it("accepts ISO date strings and Date objects", () => {
    assert.equal(validateArticle(validInput).valid, true);
    assert.equal(
      validateArticle({ ...validInput, pubDate: new Date("2024-06-01") }).valid,
      true,
    );
  });

  it("rejects invalid canonical URL", () => {
    const result = validateArticle({
      ...validInput,
      canonicalUrl: "not-a-valid-url",
    });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((issue) => issue.field === "canonicalUrl"));
  });

  it("accepts optional SEO fields", () => {
    const result = validateArticle({
      ...validInput,
      metaTitle: "SEO title",
      canonicalUrl: "https://example.com/post",
      coverImageAlt: "Cover description",
      noindex: true,
    });
    assert.equal(result.valid, true);
  });

  it("rejects empty tag entries", () => {
    const result = validateArticle({ ...validInput, tags: ["ok", "  "] });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((issue) => issue.field === "tags"));
  });
});

describe("normalizeArticle", () => {
  it("returns trimmed article fields", () => {
    const article = normalizeArticle({
      ...validInput,
      title: "  Test Post  ",
      heroImage: "/images/hero.png",
      updatedDate: "2024-06-02",
    });

    assert.equal(article.title, "Test Post");
    assert.equal(article.heroImage, "/images/hero.png");
    assert.equal(article.updatedDate, "2024-06-02");
  });

  it("throws when validation fails", () => {
    assert.throws(() => normalizeArticle({ title: "" }), /Invalid article/);
  });
});
