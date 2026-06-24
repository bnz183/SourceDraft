import assert from "node:assert/strict";
import { test } from "node:test";
import {
  friendlyConfidenceLabel,
  friendlyConfidenceLevel,
  friendlyDetectionHeadline,
  friendlyMediaLocation,
  friendlyPostsLocation,
  friendlySchemaSummary,
  siteTypeFromConfig,
} from "./detectionCopy.js";
import type { SetupDetectionSuggestion } from "./setupDetection.js";

const sampleSuggestion: SetupDetectionSuggestion = {
  framework: "Astro",
  adapter: "astro-mdx",
  contentDir: "src/content/blog",
  contentRoot: "src/content/blog",
  contentRootCandidates: ["src/content/blog"],
  postFileCount: 3,
  mediaDir: "src/assets/images",
  publicMediaPath: "/images",
  defaultBranch: "main",
  confidence: 82,
  explanation: "Found astro.config.mjs and Astro dependency.",
  warnings: [],
  frontmatter: {
    postsSampled: 2,
    fields: [
      { key: "title", frequency: 2, universalField: "title" },
      { key: "pubDate", frequency: 2, universalField: "pubDate" },
    ],
    suggestedCategories: ["Guides"],
  },
};

test("friendlyConfidenceLevel maps score bands", () => {
  assert.equal(friendlyConfidenceLevel(82), "high");
  assert.equal(friendlyConfidenceLevel(55), "medium");
  assert.equal(friendlyConfidenceLevel(20), "low");
});

test("friendlyDetectionHeadline uses framework name", () => {
  assert.equal(
    friendlyDetectionHeadline(sampleSuggestion),
    "We found an Astro site",
  );
});

test("friendlyPostsLocation counts sample articles", () => {
  assert.match(friendlyPostsLocation(sampleSuggestion), /3 articles/);
  assert.match(
    friendlyPostsLocation({ ...sampleSuggestion, postFileCount: 0 }),
    /no sample articles found yet/,
  );
});

test("friendlyMediaLocation describes folders in plain language", () => {
  assert.match(friendlyMediaLocation(sampleSuggestion), /src\/assets\/images/);
  assert.match(friendlyMediaLocation(sampleSuggestion), /\/images/);
});

test("friendlySchemaSummary maps common fields", () => {
  assert.match(friendlySchemaSummary(sampleSuggestion), /Title/);
  assert.match(friendlySchemaSummary(sampleSuggestion), /Publication date/);
});

test("siteTypeFromConfig prefers detected framework", () => {
  assert.equal(siteTypeFromConfig("astro-mdx", "Astro"), "Astro");
  assert.equal(siteTypeFromConfig("hugo-markdown", null), "Hugo");
});

test("friendlyConfidenceLabel returns readable text", () => {
  assert.equal(friendlyConfidenceLabel(82), "High confidence");
  assert.equal(friendlyConfidenceLabel(55), "Medium confidence");
});
