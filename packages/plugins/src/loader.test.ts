import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { isAdapterId, listAdapterIds } from "@sourcedraft/adapters";
import { loadPlugins, loadPluginsOrThrow } from "./loader.js";

function writePlugin(dir: string, filename: string, body: string): string {
  const filePath = join(dir, filename);
  writeFileSync(filePath, body, "utf8");
  return filePath;
}

describe("plugin loader", () => {
  it("loads a plugin that registers an adapter", async () => {
    const dir = mkdtempSync(join(tmpdir(), "sourcedraft-plugins-"));
    const relativePath = "plugins/plain-text.js";
    mkdirSync(join(dir, "plugins"), { recursive: true });

    writeFileSync(
      join(dir, relativePath),
      `
export const manifest = {
  name: "plain-text-adapter",
  version: "1.0.0",
  requiresSourceDraft: "0.0.1",
};

export function setup(context) {
  context.registerAdapter({
    id: "plain-text",
    previewMeta: { label: "Plain text", extension: "txt" },
    render(article) {
      return article.title + "\\n\\n" + article.body;
    },
    getPath(article, config) {
      return config.contentDir + "/" + article.slug + ".txt";
    },
    fromFrontmatter(path, frontmatter, body, slugFromPath) {
      return {
        title: frontmatter.title ?? "Untitled",
        slug: slugFromPath(path),
        description: frontmatter.description ?? "",
        pubDate: "2024-01-01",
        category: "Guides",
        tags: [],
        draft: false,
        body,
      };
    },
  });
}
`,
      "utf8",
    );

    const beforeCount = listAdapterIds().length;
    const report = await loadPlugins({
      configDir: dir,
      plugins: [relativePath],
    });

    assert.equal(report.ok, true);
    assert.deepEqual(report.loaded, ["plain-text-adapter"]);
    assert.equal(isAdapterId("plain-text"), true);
    assert.ok(listAdapterIds().length >= beforeCount);
  });

  it("isolates optional plugin setup failures", async () => {
    const dir = mkdtempSync(join(tmpdir(), "sourcedraft-plugins-fail-"));
    writePlugin(
      dir,
      "broken.js",
      `
export const manifest = {
  name: "broken-plugin",
  version: "1.0.0",
  requiresSourceDraft: "0.0.1",
};
export function setup() {
  throw new Error("setup exploded");
}
`,
    );

    const report = await loadPlugins({
      configDir: dir,
      plugins: ["./broken.js"],
    });

    assert.equal(report.ok, true);
    assert.equal(report.loaded.length, 0);
    assert.equal(report.failures.length, 1);
    assert.match(report.failures[0]?.error ?? "", /setup exploded/);
  });

  it("fails when a required plugin does not load", async () => {
    const dir = mkdtempSync(join(tmpdir(), "sourcedraft-plugins-required-"));
    writePlugin(
      dir,
      "invalid.js",
      `export const manifest = { name: "bad" };`,
    );

    const report = await loadPlugins({
      configDir: dir,
      plugins: ["./invalid.js"],
      requiredPlugins: ["./invalid.js"],
    });

    assert.equal(report.ok, false);
    assert.equal(report.failures[0]?.required, true);

    await assert.rejects(
      () =>
        loadPluginsOrThrow({
          configDir: dir,
          plugins: ["./invalid.js"],
          requiredPlugins: ["./invalid.js"],
        }),
      /Required plugin/,
    );
  });

  it("discovers plugins from local plugins directory when enabled", async () => {
    const dir = mkdtempSync(join(tmpdir(), "sourcedraft-plugins-discover-"));
    mkdirSync(join(dir, "plugins"), { recursive: true });
    writePlugin(
      join(dir, "plugins"),
      "auto.js",
      `
export const manifest = {
  name: "auto-discovered",
  version: "1.0.0",
  requiresSourceDraft: "0.0.1",
};
export function setup(context) {
  context.logger.info("discovered");
}
`,
    );

    const report = await loadPlugins({
      configDir: dir,
      discoverPlugins: true,
    });

    assert.equal(report.ok, true);
    assert.deepEqual(report.loaded, ["auto-discovered"]);
  });
});
