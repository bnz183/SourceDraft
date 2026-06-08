import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyzeContentQuality,
  analyzeMarkdownImages,
  countMarkdownLinks,
  countWords,
  estimateReadingTimeMinutes,
  hasMarkdownHeading,
} from "./contentQuality.js";

describe("content quality metrics", () => {
  it("counts words and reading time", () => {
    assert.equal(countWords(""), 0);
    assert.equal(countWords("one two three"), 3);
    assert.equal(estimateReadingTimeMinutes(0), 0);
    assert.equal(estimateReadingTimeMinutes(1), 1);
    assert.equal(estimateReadingTimeMinutes(200), 1);
    assert.equal(estimateReadingTimeMinutes(201), 2);
  });

  it("detects markdown headings", () => {
    assert.equal(hasMarkdownHeading("Plain paragraph"), false);
    assert.equal(hasMarkdownHeading("## Section\n\nText"), true);
  });

  it("counts internal and external links", () => {
    const body = [
      "[Internal](/docs/guide)",
      "[External](https://example.com)",
      "[Hash](#section)",
    ].join("\n");

    const counts = countMarkdownLinks(body);
    assert.equal(counts.internal, 2);
    assert.equal(counts.external, 1);
  });

  it("detects images missing alt text", () => {
    const body = "![Good alt](/a.png)\n![](/b.png)\n![  ](/c.png)";
    const images = analyzeMarkdownImages(body);
    assert.equal(images.total, 3);
    assert.equal(images.missingAlt, 2);
  });

  it("builds factual warnings without ranking claims", () => {
    const result = analyzeContentQuality(
      {
        title: "",
        description: "",
        body: "Paragraph without heading.",
        heroImage: "",
      },
      [{ field: "title", message: "Title is required." }],
    );

    assert.equal(result.metrics.wordCount, 3);
    assert.ok(result.warnings.some((warning) => warning.id === "required-title"));
    assert.ok(result.warnings.some((warning) => warning.id === "heading-missing"));
    assert.ok(
      result.warnings.every((warning) => !/rank|google|seo score/iu.test(warning.message)),
    );
  });
});
