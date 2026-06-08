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
  },
  webServer: {
    command: "SOURCEDRAFT_DEMO_MODE=true STUDIO_API_PORT=8787 pnpm --filter studio dev",
    cwd: repoRoot,
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
