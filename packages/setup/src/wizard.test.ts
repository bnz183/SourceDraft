import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import type { Interface } from "node:readline/promises";
import { backupEnvFile } from "./envFile.js";
import { runWizard } from "./wizard.js";

function mockReadline(answers: string[]): Interface {
  let index = 0;
  return {
    question: async () => answers[index++] ?? "",
    close: () => undefined,
  } as Interface;
}

test("runWizard writes config and env in temp directory", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcedraft-wizard-"));
  const answers = [
    "", // adapter default
    "", // publisher default
    "", // media default
    "", // contentDir default
    "", // mediaDir default
    "", // branch default
    "", // categories default
    "n", // deploy hook
    "ghp_test_token", // GITHUB_TOKEN
    "acme", // GITHUB_OWNER
    "blog", // GITHUB_REPO
    "", // GITHUB_BRANCH skip
    "studio-pass", // admin password
    "", // write files yes
    "n", // connection checks
  ];

  const result = await runWizard({
    cwd: dir,
    rl: mockReadline(answers),
    now: () => new Date("2026-06-08T12:00:00.000Z"),
  });

  const config = JSON.parse(
    readFileSync(result.configPath, "utf8"),
  ) as Record<string, unknown>;

  assert.equal(config.adapter, "astro-mdx");
  assert.equal(config.publisher, "github");
  assert.equal(config.contentDir, "src/content/blog");

  const envContent = readFileSync(result.envPath, "utf8");
  assert.match(envContent, /CMS_PUBLISHER=github/);
  assert.match(envContent, /GITHUB_OWNER=acme/);
  assert.match(envContent, /GITHUB_TOKEN=ghp_test_token/);
});

test("runWizard backs up existing env before writing", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcedraft-wizard-backup-"));
  const envPath = join(dir, ".env");
  writeFileSync(envPath, "GITHUB_TOKEN=existing\nCMS_PUBLISHER=github\n", "utf8");

  const answers = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "n",
    "", // keep existing GITHUB_TOKEN
    "acme",
    "blog",
    "",
    "studio-pass",
    "",
    "n",
  ];

  await runWizard({
    cwd: dir,
    rl: mockReadline(answers),
    now: () => new Date("2026-06-08T12:00:00.000Z"),
  });

  const backups = existsSync(join(dir, ".env.backup.2026-06-08T12-00-00-000Z"));
  assert.ok(backups);

  const envContent = readFileSync(envPath, "utf8");
  assert.match(envContent, /GITHUB_TOKEN=existing/);
});

test("backupEnvFile is used when env exists before wizard write", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcedraft-backup-"));
  const envPath = join(dir, ".env");
  writeFileSync(envPath, "KEY=val\n", "utf8");
  const backup = backupEnvFile(envPath, new Date("2026-06-08T12:00:00.000Z"));
  assert.ok(backup);
  assert.ok(existsSync(backup!));
});
