import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  backupEnvFile,
  loadEnvMap,
  mergeEnvMaps,
  parseEnvFile,
  serializeEnvFile,
} from "./envFile.js";

test("parseEnvFile ignores comments and parses quoted values", () => {
  const map = parseEnvFile(`
# comment
GITHUB_TOKEN=ghp_secret
GITHUB_OWNER="acme"
EMPTY=
`);

  assert.equal(map.get("GITHUB_TOKEN"), "ghp_secret");
  assert.equal(map.get("GITHUB_OWNER"), "acme");
  assert.equal(map.get("EMPTY"), "");
});

test("backupEnvFile creates timestamped copy", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcedraft-setup-"));
  const envPath = join(dir, ".env");
  writeFileSync(envPath, "GITHUB_TOKEN=old\n", "utf8");

  const fixedDate = new Date("2026-06-08T12:00:00.000Z");
  const backupPath = backupEnvFile(envPath, fixedDate);

  assert.ok(backupPath);
  assert.ok(existsSync(backupPath!));
  assert.equal(readFileSync(backupPath!, "utf8"), "GITHUB_TOKEN=old\n");
});

test("mergeEnvMaps respects overwrite decisions", () => {
  const existing = new Map([
    ["GITHUB_TOKEN", "keep-me"],
    ["GITHUB_OWNER", ""],
  ]);
  const updates = new Map([
    ["GITHUB_TOKEN", "new-token"],
    ["GITHUB_OWNER", "acme"],
  ]);

  const merged = mergeEnvMaps(existing, updates, (_key, existingValue) =>
    existingValue.trim().length > 0 ? "skip" : "set",
  );

  assert.equal(merged.get("GITHUB_TOKEN"), "keep-me");
  assert.equal(merged.get("GITHUB_OWNER"), "acme");
});

test("serializeEnvFile round-trips through loadEnvMap", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcedraft-setup-"));
  const envPath = join(dir, ".env");
  const map = new Map([
    ["CMS_PUBLISHER", "github"],
    ["GITHUB_TOKEN", "secret value"],
  ]);

  writeFileSync(envPath, serializeEnvFile(map), "utf8");
  const loaded = loadEnvMap(envPath);

  assert.equal(loaded.get("CMS_PUBLISHER"), "github");
  assert.equal(loaded.get("GITHUB_TOKEN"), "secret value");
});
