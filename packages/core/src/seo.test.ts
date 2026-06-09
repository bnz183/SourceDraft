import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSeoWarnings,
  computeReadingTimeMinutes,
  isValidCanonicalUrl,
  resolveMetaDescription,
  resolveMetaTitle,
  resolveSocialImage,
} from "./seo.js";

describe("seo helpers", () => {
  it("resolves meta title and description fallbacks", () => {
    assert.equal(
      resolveMetaTitle({ title: "Post title", metaTitle: "SEO title" }),
      "SEO title",
    );
    assert.equal(resolveMetaTitle({ title: "Post title" }), "Post title");
    assert.equal(
      resolveMetaDescription({
        description: "Summary",
        metaDescription: "SEO summary",
      }),
      "SEO summary",
    );
    assert.equal(resolveMetaDescription({ description: "Summary" }), "Summary");
  });

  it("resolves social image from cover fallback", () => {
    assert.equal(
      resolveSocialImage({
        heroImage: "/images/cover.png",
        socialImage: "/images/social.png",
      }),
      "/images/social.png",
    );
    assert.equal(
      resolveSocialImage({ heroImage: "/images/cover.png" }),
      "/images/cover.png",
    );
  });

  it("validates canonical URLs", () => {
    assert.equal(isValidCanonicalUrl("https://example.com/post"), true);
    assert.equal(isValidCanonicalUrl("not-a-url"), false);
    assert.equal(isValidCanonicalUrl("ftp://example.com"), false);
  });

  it("computes reading time from body", () => {
    const body = "word ".repeat(400).trim();
    assert.equal(computeReadingTimeMinutes(body), 2);
    assert.equal(computeReadingTimeMinutes(""), 0);
  });

  it("builds soft SEO warnings without blocking", () => {
    const warnings = buildSeoWarnings({
      title: "Title",
      slug: "title",
      description: "Desc",
      pubDate: "2024-01-01",
      category: "Guides",
      tags: ["a"],
      draft: false,
      body: "Body",
      metaTitle: "x".repeat(70),
      heroImage: "/cover.png",
    });

    assert.ok(warnings.some((warning) => warning.id === "meta-title-long"));
    assert.ok(warnings.some((warning) => warning.id === "cover-alt-missing"));
  });
});
