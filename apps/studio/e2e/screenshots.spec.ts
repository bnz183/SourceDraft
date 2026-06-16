import { expect, test } from "@playwright/test";
import {
  attachPageErrorLogging,
  ensureScreenshotDir,
  enterDemoMode,
  fillPostBody,
  postBodyEditor,
  postDescriptionInput,
  postTitleInput,
  screenshotPath,
  STUDIO_VIEWPORT,
} from "./helpers.js";

test.describe("release screenshots", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    ensureScreenshotDir();
  });

  test.use({ viewport: STUDIO_VIEWPORT });

  test("generates docs/assets screenshots from demo mode", async ({ page }) => {
    test.setTimeout(120_000);
    attachPageErrorLogging(page);

    await enterDemoMode(page);
    await page.screenshot({
      path: screenshotPath("studio-overview.png"),
      fullPage: false,
    });

    await page.getByRole("button", { name: "Getting started with SourceDraft" }).click();
    await expect(postBodyEditor(page)).toBeVisible();

    await page.screenshot({
      path: screenshotPath("editor.png"),
      fullPage: false,
    });

    await page.locator(".editor-toolbar-wrap").screenshot({
      path: screenshotPath("toolbar.png"),
    });

    await postTitleInput(page).fill("Screenshot autosave example");
    await expect(page.getByText("Unsaved changes", { exact: false })).toBeVisible({
      timeout: 5000,
    });
    await page.locator(".app-bar").screenshot({
      path: screenshotPath("autosave.png"),
    });

    await page.locator(".media-library").screenshot({
      path: screenshotPath("media-library.png"),
    });

    await page.locator(".content-quality").screenshot({
      path: screenshotPath("content-quality.png"),
    });

    await page.locator(".preview-panel").screenshot({
      path: screenshotPath("preview.png"),
    });

    await page.getByRole("button", { name: "New article" }).click();
    await postTitleInput(page).fill("Screenshot publish example");
    await postDescriptionInput(page).fill(
      "Summary used for automated publish-success screenshot.",
    );
    await fillPostBody(
      page,
      "# Screenshot publish example\n\nBody for release screenshot capture.",
    );
    await page.getByRole("button", { name: "Simulate send to blog" }).click();
    await expect(page.getByText("Send simulated")).toBeVisible({ timeout: 10_000 });
    await page.locator(".publish-bar").screenshot({
      path: screenshotPath("publish-success.png"),
    });

    await page.getByRole("button", { name: "Settings" }).click();
    await expect(page.getByRole("heading", { name: "Publishing readiness" })).toBeVisible();
    await page.locator(".setup-health").screenshot({
      path: screenshotPath("setup-health.png"),
    });
  });
});
