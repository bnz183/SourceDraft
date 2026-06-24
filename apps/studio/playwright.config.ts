import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "../..");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: "SOURCEDRAFT_DEMO_MODE=true STUDIO_API_PORT=8787 SOURCEDRAFT_REPO_ROOT=. pnpm --dir apps/studio exec concurrently -n web,api -c blue,gray --kill-others \"pnpm exec vite --host 127.0.0.1\" \"pnpm exec tsx server/index.ts\"",
    cwd: repoRoot,
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
