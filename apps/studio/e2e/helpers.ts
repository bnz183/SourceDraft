import { expect, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

export const REPO_ROOT = resolve(import.meta.dirname, "../../..");
export const SCREENSHOT_DIR = resolve(REPO_ROOT, "docs/assets");

export const STUDIO_VIEWPORT = { width: 1280, height: 900 };

export function attachPageErrorLogging(page: Page): void {
  page.on("pageerror", (error) => {
    console.error("Page error:", error.message);
  });
}

export async function waitForStudioRoot(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.locator("#root")).not.toBeEmpty({ timeout: 30_000 });
}

export function postTitleInput(page: Page) {
  return page.getByTestId("post-title-input");
}

export function postDescriptionInput(page: Page) {
  return page.getByTestId("post-description-input");
}

export async function enterDemoMode(page: Page): Promise<void> {
  attachPageErrorLogging(page);
  await waitForStudioRoot(page);
  await expect(page.getByRole("heading", { name: "SourceDraft Studio" })).toBeVisible();

  const demoToggle = page.getByRole("checkbox", { name: "Demo mode" });
  if (await demoToggle.isVisible()) {
    if (!(await demoToggle.isChecked())) {
      await demoToggle.check();
    }
    await page.getByRole("button", { name: "Continue in demo" }).click();
  } else {
    await page.getByRole("button", { name: "Sign in" }).click();
  }

  await expect(page.getByText("Demo mode — no GitHub commits are made")).toBeVisible();
}

export function ensureScreenshotDir(): void {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

export function screenshotPath(filename: string): string {
  return resolve(SCREENSHOT_DIR, filename);
}
