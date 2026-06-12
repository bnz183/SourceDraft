import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { detectContentRoot } from "./contentRootDetection.js";

describe("detectContentRoot", () => {
  it("prefers Astro blog folder when posts live there", () => {
    const root = mkdtempSync(join(tmpdir(), "content-root-astro-"));
    mkdirSync(join(root, "src/content/blog"), { recursive: true });
    writeFileSync(join(root, "src/content/blog/post.mdx"), "---\ntitle: Hi\n---\n", "utf8");

    const detected = detectContentRoot(root, "astro-mdx", "src/content/blog");
    assert.equal(detected.contentDir, "src/content/blog");
    assert.ok(detected.postCount >= 1);
  });

  it("detects Hugo content/posts when markdown files are present", () => {
    const root = mkdtempSync(join(tmpdir(), "content-root-hugo-"));
    mkdirSync(join(root, "content/posts"), { recursive: true });
    writeFileSync(join(root, "content/posts/post.md"), "---\ntitle: Hi\n---\n", "utf8");

    const detected = detectContentRoot(root, "hugo-markdown", "content/posts");
    assert.equal(detected.contentDir, "content/posts");
    assert.ok(detected.postCount >= 1);
  });
});
