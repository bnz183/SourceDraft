import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { detectSetup } from "@sourcedraft/setup";
import { runGenerateConfig } from "./generateConfig.js";
import { resolveSetupDetectionRoot } from "./setupDetection.js";

describe("generate config from detection", () => {
  it("creates config for an Astro sample project", () => {
    const root = mkdtempSync(join(tmpdir(), "api-generate-config-"));
    process.env.SOURCEDRAFT_REPO_ROOT = root;
    writeFileSync(join(root, "astro.config.mjs"), "export default {};\n", "utf8");
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({ dependencies: { astro: "^5.0.0" } }),
      "utf8",
    );
    mkdirSync(join(root, "src/content/blog"), { recursive: true });
    writeFileSync(join(root, "src/content/blog/post.mdx"), "---\ntitle: Hi\n---\n", "utf8");

    const detection = detectSetup(root);
    const result = runGenerateConfig();
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }

    assert.equal(resolveSetupDetectionRoot(), root);
    assert.match(result.summary, /adapter: astro-mdx/u);
    assert.match(result.summary, /contentDir: src\/content\/blog/u);
    delete process.env.SOURCEDRAFT_REPO_ROOT;
  });

  it("honors selected content root override", () => {
    const root = mkdtempSync(join(tmpdir(), "api-generate-config-root-"));
    process.env.SOURCEDRAFT_REPO_ROOT = root;
    writeFileSync(join(root, "astro.config.mjs"), "export default {};\n", "utf8");
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({ dependencies: { astro: "^5.0.0" } }),
      "utf8",
    );
    mkdirSync(join(root, "src/content/blog"), { recursive: true });
    mkdirSync(join(root, "src/content/posts"), { recursive: true });
    writeFileSync(join(root, "src/content/blog/post.mdx"), "---\ntitle: Hi\n---\n", "utf8");
    writeFileSync(join(root, "src/content/posts/other.mdx"), "---\ntitle: Other\n---\n", "utf8");

    const result = runGenerateConfig({
      adapter: "astro-mdx",
      contentRoot: "src/content/posts",
    });
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }

    assert.match(result.summary, /contentDir: src\/content\/posts/u);
    delete process.env.SOURCEDRAFT_REPO_ROOT;
  });
});
