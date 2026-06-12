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

test("serializeEnvFile escapes unsafe values and rejects invalid keys", () => {
  const map = new Map([
    ["GITHUB_TOKEN", "secret value"],
    ["QUOTED", 'say "hello"'],
    ["BACKSLASH", "path\\to\\file"],
    ["NEWLINE", "line1\nline2"],
    ["CARRIAGE", "line1\rline2"],
    ["TAB", "col1\tcol2"],
    ["EMPTY", ""],
    ["HASH", "value#comment"],
    ["EQUALS", "key=value"],
    ["INJECTION", "safe\nGITHUB_TOKEN=hijacked"],
    ["QUOTE_INJECT", 'abc"\nEVIL=true'],
  ]);

  const serialized = serializeEnvFile(map);
  assert.match(serialized, /GITHUB_TOKEN="secret value"/);
  assert.match(serialized, /QUOTED=/);
  assert.match(serialized, /\\n/);
  assert.match(serialized, /EMPTY=""/);
  assert.doesNotMatch(serialized, /^GITHUB_TOKEN=hijacked/m);

  const loaded = parseEnvFile(serialized);
  assert.equal(loaded.get("GITHUB_TOKEN"), "secret value");
  assert.equal(loaded.get("QUOTED"), 'say "hello"');
  assert.equal(loaded.get("BACKSLASH"), "path\\to\\file");
  assert.equal(loaded.get("NEWLINE"), "line1\nline2");
  assert.equal(loaded.get("CARRIAGE"), "line1\rline2");
  assert.equal(loaded.get("TAB"), "col1\tcol2");
  assert.equal(loaded.get("EMPTY"), "");
  assert.equal(loaded.get("HASH"), "value#comment");
  assert.equal(loaded.get("EQUALS"), "key=value");
  assert.equal(loaded.get("INJECTION"), "safe\nGITHUB_TOKEN=hijacked");
  assert.equal(loaded.get("QUOTE_INJECT"), 'abc"\nEVIL=true');

  assert.throws(() => serializeEnvFile(new Map([["bad-key", "value"]])), /Invalid env key/);
  assert.throws(() => serializeEnvFile(new Map([["123", "value"]])), /Invalid env key/);
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
