import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import type { SetupDetectionSuggestion } from "./detectSetup.js";
import { generateConfigFromDetection } from "./createConfigFromDetection.js";

const sampleSuggestion: SetupDetectionSuggestion = {
  framework: "Astro MDX",
  adapter: "astro-mdx",
  contentDir: "src/content/blog",
  contentRoot: "src/content/blog",
  contentRootCandidates: [],
  postFileCount: 2,
  mediaDir: "public/images",
  publicMediaPath: "/images",
  defaultBranch: "main",
  confidence: 95,
  explanation: "astro dependency",
  warnings: [],
  frontmatter: {
    postsSampled: 2,
    fields: [{ key: "title", frequency: 2, universalField: "title" }],
    suggestedCategories: ["AI-Assisted Publishing", "Workflow Automation"],
  },
};

describe("generateConfigFromDetection", () => {
  it("writes sourcedraft.config.json when missing", () => {
    const root = mkdtempSync(join(tmpdir(), "generate-config-"));
    const result = generateConfigFromDetection(root, sampleSuggestion);
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }

    assert.ok(existsSync(result.configPath));
    const config = JSON.parse(readFileSync(result.configPath, "utf8")) as Record<string, unknown>;
    assert.equal(config.adapter, "astro-mdx");
    assert.equal(config.contentDir, "src/content/blog");
    assert.deepEqual(config.categories, ["AI-Assisted Publishing", "Workflow Automation"]);
  });

  it("does not overwrite an existing config file", () => {
    const root = mkdtempSync(join(tmpdir(), "generate-config-exists-"));
    const configPath = join(root, "sourcedraft.config.json");
    writeFileSync(configPath, "{}\n", "utf8");

    const result = generateConfigFromDetection(root, sampleSuggestion);
    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }

    assert.equal(result.code, "exists");
  });
});
