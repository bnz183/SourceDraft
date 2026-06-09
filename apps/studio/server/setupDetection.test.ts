import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { detectSetup } from "@sourcedraft/setup";

describe("setup detection API helpers", () => {
  it("detectSetup returns astro suggestion for astro markers", () => {
    const root = mkdtempSync(join(tmpdir(), "api-detect-astro-"));
    writeFileSync(join(root, "astro.config.mjs"), "export default {};\n", "utf8");
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({ dependencies: { astro: "^5.0.0" } }),
      "utf8",
    );
    mkdirSync(join(root, "src/content/blog"), { recursive: true });
    writeFileSync(join(root, "src/content/blog/post.mdx"), "---\ntitle: Hi\n---\n", "utf8");

    const result = detectSetup(root);
    assert.equal(result.primary?.adapter, "astro-mdx");
  });
});
