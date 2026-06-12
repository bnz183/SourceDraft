import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { inferFrontmatterSchema } from "./inferFrontmatterSchema.js";

describe("inferFrontmatterSchema", () => {
  it("infers common Hugo frontmatter fields and categories", () => {
    const root = mkdtempSync(join(tmpdir(), "frontmatter-hugo-"));
    const contentDir = "content/posts";
    mkdirSync(join(root, contentDir), { recursive: true });
    writeFileSync(
      join(root, contentDir, "one.md"),
      "---\ntitle: One\ndate: 2026-01-01\ntags: [a, b]\ncategories: Guides\ndraft: true\n---\nBody\n",
      "utf8",
    );
    writeFileSync(
      join(root, contentDir, "two.md"),
      "---\ntitle: Two\ndate: 2026-01-02\ntags: [c]\ncategories: Guides\n---\nBody\n",
      "utf8",
    );

    const schema = inferFrontmatterSchema(root, contentDir);
    assert.ok(schema);
    assert.equal(schema?.postsSampled, 2);
    assert.ok(schema?.fields.some((field) => field.key === "title"));
    assert.ok(schema?.fields.some((field) => field.key === "date" && field.universalField === "pubDate"));
    assert.deepEqual(schema?.suggestedCategories, ["Guides"]);
  });
});
