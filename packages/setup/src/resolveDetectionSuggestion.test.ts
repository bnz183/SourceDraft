import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SetupDetectionResult, SetupDetectionSuggestion } from "./detectSetup.js";
import {
  applySuggestionOverrides,
  pickDetectionSuggestionFromResult,
  resolveDetectionSuggestion,
} from "./resolveDetectionSuggestion.js";

const astro: SetupDetectionSuggestion = {
  framework: "Astro",
  adapter: "astro-mdx",
  contentDir: "src/content/blog",
  contentRoot: "src/content/blog",
  contentRootCandidates: ["src/content/blog", "src/content/posts"],
  postFileCount: 3,
  mediaDir: "src/assets/images",
  publicMediaPath: "/images",
  defaultBranch: "main",
  confidence: 90,
  explanation: "Found astro.config.mjs",
  warnings: [],
  frontmatter: null,
};

const nextjs: SetupDetectionSuggestion = {
  ...astro,
  framework: "Next.js",
  adapter: "nextjs-mdx",
  contentDir: "content/posts",
  contentRoot: "content/posts",
  confidence: 55,
  explanation: "Found next.config.js",
};

const detection: SetupDetectionResult = {
  scannedRoot: "/repo",
  detected: true,
  primary: astro,
  alternatives: [nextjs],
  warnings: [],
  onboardingMessage: null,
  failureMessage: null,
};

describe("resolveDetectionSuggestion", () => {
  it("returns primary when adapter is omitted", () => {
    assert.equal(pickDetectionSuggestionFromResult(detection, null)?.adapter, "astro-mdx");
  });

  it("returns the selected alternative adapter", () => {
    assert.equal(
      pickDetectionSuggestionFromResult(detection, "nextjs-mdx")?.framework,
      "Next.js",
    );
  });

  it("applies a chosen content root override", () => {
    const resolved = applySuggestionOverrides(astro, {
      contentRoot: "src/content/posts",
    });
    assert.equal(resolved.contentDir, "src/content/posts");
    assert.equal(resolved.contentRoot, "src/content/posts");
  });

  it("combines adapter and content root selection", () => {
    const resolved = resolveDetectionSuggestion(detection, {
      adapter: "nextjs-mdx",
      contentRoot: "content/posts",
    });
    assert.equal(resolved?.adapter, "nextjs-mdx");
    assert.equal(resolved?.contentDir, "content/posts");
  });
});
