import { expect, test } from "@playwright/test";
import {
  attachPageErrorLogging,
  enterDemoMode,
  fillPostBody,
  postBodyEditor,
  postDescriptionInput,
  postTitleInput,
  waitForStudioRoot,
} from "./helpers.js";

test.describe("Studio smoke", () => {
  test("login/demo entry renders", async ({ page }) => {
    attachPageErrorLogging(page);
    await waitForStudioRoot(page);
    await expect(page.getByRole("heading", { name: "SourceDraft Studio" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Try demo mode" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your writing dashboard" })).toBeVisible();
  });

  test("overview/post list renders in demo mode", async ({ page }) => {
    await enterDemoMode(page);
    await expect(page.getByRole("heading", { name: "Articles" })).toBeVisible();
    await expect(page.getByText("Getting started with SourceDraft")).toBeVisible();
  });

  test("new post form and editor accept text", async ({ page }) => {
    await enterDemoMode(page);
    await page.getByRole("button", { name: "New article" }).click();
    await postTitleInput(page).fill("Smoke test post");
    await postDescriptionInput(page).fill(
      "A short summary for the smoke test post.",
    );
    await fillPostBody(page, "## Smoke test section\n\nBody text for smoke testing.");
    await expect(postBodyEditor(page)).toContainText("Smoke test section");
  });

  test("toolbar inserts Markdown", async ({ page }) => {
    await enterDemoMode(page);
    await page.getByRole("button", { name: "New article" }).click();
    await fillPostBody(page, "Selected text");
    await page.keyboard.press("Control+A");
    await page.getByRole("button", { name: "Bold" }).click();
    await expect(postBodyEditor(page)).toContainText("Selected text");
  });

  test("autosave status appears after edits", async ({ page }) => {
    await enterDemoMode(page);
    await page.getByRole("button", { name: "New article" }).click();
    await postTitleInput(page).fill("Autosave smoke test");
    await expect(page.getByText("Unsaved changes", { exact: false })).toBeVisible({
      timeout: 5000,
    });
  });

  test("media library and content quality panels render", async ({ page }) => {
    await enterDemoMode(page);
    await expect(page.getByRole("heading", { name: "Media library" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Content quality" })).toBeVisible();
  });

  test("settings setup health renders", async ({ page }) => {
    await enterDemoMode(page);
    await page.getByRole("button", { name: "Settings" }).click();
    await expect(page.getByRole("heading", { name: "Welcome to SourceDraft" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Setup detection" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Content audit" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Publishing readiness" })).toBeVisible();
    await expect(page.getByText("Studio password")).toBeVisible();
    await expect(page.getByText("GitHub connection")).toBeVisible();
  });

  test("publish checklist renders in demo mode", async ({ page }) => {
    await enterDemoMode(page);
    await page.getByRole("button", { name: "New article" }).click();
    await postTitleInput(page).fill("Checklist smoke test");
    await postDescriptionInput(page).fill("Summary for checklist smoke test.");
    await fillPostBody(page, "# Checklist\n\nBody content.");
    await expect(page.getByRole("heading", { name: "Publish checklist" })).toBeVisible();
    await expect(page.getByText("Validation")).toBeVisible();
    await expect(page.getByText("Output path")).toBeVisible();
  });

  test("publish success can be simulated in demo mode", async ({ page }) => {
    await enterDemoMode(page);
    await page.getByRole("button", { name: "New article" }).click();
    await postTitleInput(page).fill("Demo publish smoke test");
    await postDescriptionInput(page).fill(
      "Summary for demo publish smoke test.",
    );
    await fillPostBody(page, "# Demo publish\n\nBody content.");
    await page.getByRole("button", { name: "Simulate send to blog" }).click();
    await expect(page.getByText("Send simulated")).toBeVisible({ timeout: 10_000 });
  });

  test("publish mode selector renders in demo mode", async ({ page }) => {
    await enterDemoMode(page);
    await page.getByRole("button", { name: "New article" }).click();
    await postTitleInput(page).fill("Publish mode smoke test");
    await postDescriptionInput(page).fill(
      "Summary for publish mode smoke test.",
    );
    await fillPostBody(page, "# Publish mode\n\nBody content.");

    const modeSelect = page.locator("#publish-mode-select");
    await expect(modeSelect).toBeVisible();
    await modeSelect.selectOption("pull-request");
    await expect(page.getByText("PR branch")).toBeVisible();
    await page.getByRole("button", { name: "Simulate review request" }).click();
    await expect(page.getByText("Review request simulated")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("source mode toggle preserves raw body", async ({ page }) => {
    await enterDemoMode(page);
    await page.getByRole("button", { name: "New article" }).click();
    await fillPostBody(page, "<CustomBlock />\n\n## Heading");
    await page.getByRole("button", { name: "Source", exact: true }).click();
    const source = page.getByTestId("post-body-source");
    await expect(source).toBeVisible();
    await expect(source).toHaveValue(/<CustomBlock \/>/u);
  });
});
