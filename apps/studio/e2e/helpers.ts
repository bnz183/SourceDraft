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

export function postBodyEditor(page: Page) {
  return page.locator('[data-testid="post-body-editor"]');
}

export async function fillPostBody(page: Page, value: string): Promise<void> {
  const editor = postBodyEditor(page);
  await editor.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.type(value);
}

export async function enterDemoMode(page: Page): Promise<void> {
  attachPageErrorLogging(page);
  await waitForStudioRoot(page);
  await expect(page.getByRole("heading", { name: "SourceDraft Studio" })).toBeVisible();
  await page.getByTestId("try-demo-mode").click();
  await expect(
    page.getByText("Demo mode — explore without connecting a real blog"),
  ).toBeVisible();
}

export function ensureScreenshotDir(): void {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

export function screenshotPath(filename: string): string {
  return resolve(SCREENSHOT_DIR, filename);
}
