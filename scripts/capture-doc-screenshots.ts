#!/usr/bin/env node
/**
 * Capture documentation screenshots from official third-party API docs.
 *
 * LEGAL: Only run with --confirm-attribution after verifying each site's
 * terms of use, robots.txt, and brand guidelines allow saving screenshots
 * in an open-source repository. Do not commit captures without updating
 * docs/assets/screenshots/ATTRIBUTION.md.
 *
 * Usage:
 *   pnpm capture-doc-screenshots -- --confirm-attribution
 *
 * Requires Playwright (installed in apps/studio).
 */

import { mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../docs/assets/screenshots/connectors");

const TARGETS = [
  {
    id: "gitlab-repository-files-api",
    url: "https://docs.gitlab.com/ee/api/repository_files.html",
    owner: "GitLab Inc.",
  },
  {
    id: "bitbucket-source-api",
    url: "https://developer.atlassian.com/cloud/bitbucket/rest/api-group-source/",
    owner: "Atlassian",
  },
  {
    id: "wordpress-rest-posts",
    url: "https://developer.wordpress.org/rest-api/reference/posts/",
    owner: "WordPress Foundation",
  },
  {
    id: "ghost-admin-api",
    url: "https://docs.ghost.org/admin-api/",
    owner: "Ghost Foundation",
  },
  {
    id: "cloudinary-upload-api",
    url: "https://cloudinary.com/documentation/image_upload_api_reference",
    owner: "Cloudinary Ltd.",
  },
  {
    id: "cloudflare-r2-s3",
    url: "https://developers.cloudflare.com/r2/",
    owner: "Cloudflare, Inc.",
  },
] as const;

async function loadPlaywright(): Promise<typeof import("@playwright/test")> {
  try {
    return await import("@playwright/test");
  } catch {
    console.error(
      "Playwright not found. Install via apps/studio:\n  pnpm --filter studio install\nThen run from repo root with NODE_PATH or:\n  cd apps/studio && pnpm exec tsx ../../scripts/capture-doc-screenshots.ts --confirm-attribution",
    );
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const confirm = process.argv.includes("--confirm-attribution");

  if (!confirm) {
    console.log("Connector doc screenshot capture\n");
    console.log("This script saves PNG files from official third-party documentation.");
    console.log("Screenshots are NOT captured by default.\n");
    console.log("Before capturing:");
    console.log("  1. Verify each site's terms, robots.txt, and brand guidelines.");
    console.log("  2. Update docs/assets/screenshots/ATTRIBUTION.md after committing.\n");
    console.log("Targets:");
    for (const target of TARGETS) {
      console.log(`  - ${target.id}: ${target.url}`);
    }
    console.log("\nRun with: pnpm capture-doc-screenshots -- --confirm-attribution");
    process.exit(0);
  }

  const { chromium } = await loadPlaywright();
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });

  const stamp = new Date().toISOString().slice(0, 10);

  for (const target of TARGETS) {
    const outPath = resolve(OUT_DIR, `${target.id}.png`);
    console.log(`Capturing ${target.url} → ${outPath}`);

    const page = await context.newPage();
    try {
      await page.goto(target.url, { waitUntil: "networkidle", timeout: 60_000 });
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`  OK (${target.owner}, ${stamp})`);
    } catch (error) {
      console.error(
        `  Failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log("\nDone. Update docs/assets/screenshots/ATTRIBUTION.md before committing images.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
