import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { maskSecretValue } from "./maskSecrets.js";
import { validateConfig } from "./validateConfig.js";

test("maskSecretValue hides token contents", () => {
  assert.equal(maskSecretValue("ghp_abcdefghijklmnop"), "gh…op (20 chars)");
  assert.equal(maskSecretValue("ab"), "****");
});

test("validateConfig passes with valid github setup", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcedraft-setup-"));
  writeFileSync(
    join(dir, "sourcedraft.config.json"),
    JSON.stringify({
      adapter: "astro-mdx",
      publisher: "github",
      contentDir: "src/content/blog",
      mediaDir: "public/images",
      publicMediaPath: "/images",
      defaultBranch: "main",
      categories: ["Guides"],
    }),
    "utf8",
  );

  const report = validateConfig({
    cwd: dir,
    env: {
      CMS_PUBLISHER: "github",
      CMS_MEDIA_PROVIDER: "github-media",
      GITHUB_TOKEN: "ghp_test",
      GITHUB_OWNER: "acme",
      GITHUB_REPO: "blog",
    },
  });

  assert.equal(report.ok, true);
  assert.equal(report.adapter, "astro-mdx");
  assert.equal(report.publisher, "github");
  assert.equal(report.mediaProvider, "github-media");
  assert.deepEqual(report.missingEnvVars, []);
});

test("validateConfig fails for unknown adapter and publisher", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcedraft-setup-"));
  writeFileSync(
    join(dir, "sourcedraft.config.json"),
    JSON.stringify({
      adapter: "not-real",
      publisher: "not-real",
      contentDir: "src/content/blog",
      mediaDir: "public/images",
      publicMediaPath: "/images",
      defaultBranch: "main",
      categories: ["Guides"],
    }),
    "utf8",
  );

  const report = validateConfig({
    cwd: dir,
    env: { CMS_MEDIA_PROVIDER: "github-media" },
  });

  assert.equal(report.ok, false);
  assert.ok(report.issues.some((issue) => issue.field === "adapter"));
  assert.ok(report.issues.some((issue) => issue.field === "publisher"));
});

test("validateConfig reports missing publisher env vars", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcedraft-setup-"));
  writeFileSync(
    join(dir, "sourcedraft.config.json"),
    JSON.stringify({
      adapter: "astro-mdx",
      publisher: "github",
      contentDir: "src/content/blog",
      mediaDir: "public/images",
      publicMediaPath: "/images",
      defaultBranch: "main",
      categories: ["Guides"],
    }),
    "utf8",
  );

  const report = validateConfig({
    cwd: dir,
    env: {
      CMS_PUBLISHER: "github",
      CMS_MEDIA_PROVIDER: "github-media",
    },
  });

  assert.equal(report.ok, false);
  assert.ok(report.missingEnvVars.includes("GITHUB_TOKEN"));
  assert.ok(report.missingEnvVars.includes("GITHUB_OWNER"));
  assert.ok(report.missingEnvVars.includes("GITHUB_REPO"));
});
