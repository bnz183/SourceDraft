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
    await expect(page.getByTestId("try-demo-mode")).toBeVisible();
    await expect(page.getByRole("heading", { name: "How do you want to start?" })).toBeVisible();
    await expect(page.getByText("Explore SourceDraft with sample posts. Nothing is published.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Write in an already-configured Studio" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Connect an existing blog" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Advanced developer setup" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Agent-ready workflow" })).toBeVisible();
    await expect(
      page.getByText(
        "SourceDraft can inspect your project and suggest where articles and images should go.",
      ),
    ).toBeVisible();
  });

  test("overview/post list renders in demo mode", async ({ page }) => {
    await enterDemoMode(page);
    await expect(page.getByText("Quick start")).toBeVisible();
    await page.getByRole("button", { name: "Dismiss" }).click();
    await expect(page.getByRole("heading", { name: "Articles" })).toBeVisible();
    await expect(page.getByText("AI-assisted publishing with SourceDraft")).toBeVisible();
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
    await page.getByRole("button", { name: "Bold", exact: true }).click();
    await expect(postBodyEditor(page)).toContainText("Selected text");
    await expect(page.getByRole("button", { name: "Bold", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("toolbar renders grouped formatting controls", async ({ page }) => {
    await enterDemoMode(page);
    await page.getByRole("button", { name: "New article" }).click();
    const toolbar = page.getByRole("toolbar", { name: "Editor formatting" });
    for (const name of [
      "Paragraph",
      "Heading 1",
      "Bold",
      "Italic",
      "Strikethrough",
      "Inline code",
      "Clear formatting",
      "Bullet list",
      "Numbered list",
      "Blockquote",
      "Code block",
      "Insert or edit link",
      "Insert image",
      "Insert file link",
      "Undo",
      "Redo",
    ]) {
      await expect(toolbar.getByRole("button", { name, exact: true })).toBeVisible();
    }
    await expect(toolbar.getByRole("button", { name: "Undo" })).toBeDisabled();
    await expect(toolbar.getByRole("button", { name: "Redo" })).toBeDisabled();
  });

  test("mobile sidebar can expand and collapse", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await enterDemoMode(page);
    const toggle = page.getByRole("button", { name: "Show all posts" });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    const collapse = page.getByRole("button", { name: "Collapse posts" });
    await expect(collapse).toHaveAttribute("aria-expanded", "true");
  });

  test("editor toolbar exposes core formatting controls", async ({ page }) => {
    await enterDemoMode(page);
    await page.getByRole("button", { name: "New article" }).click();
    await expect(page.getByRole("toolbar", { name: "Editor formatting" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Italic" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Insert image" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Insert file link" })).toBeVisible();
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
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Status & configuration" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Welcome to SourceDraft" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Publishing readiness" })).toBeVisible();
    await page.locator("summary.settings-view__advanced-summary").click();
    await expect(page.getByRole("heading", { name: "Diagnostics" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Setup detection" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Content audit" })).toBeVisible();
    await expect(page.getByText("Studio password", { exact: true })).toBeVisible();
    await expect(page.getByText("GitHub connection", { exact: true })).toBeVisible();
  });

  test("publish checklist renders in demo mode", async ({ page }) => {
    await enterDemoMode(page);
    await page.getByRole("button", { name: "New article" }).click();
    await postTitleInput(page).fill("Checklist smoke test");
    await postDescriptionInput(page).fill("Summary for checklist smoke test.");
    await fillPostBody(page, "# Checklist\n\nBody content.");
    await expect(page.getByRole("heading", { name: "Before you send" })).toBeVisible();
    const checklist = page.getByLabel("Before you send");
    await expect(checklist.getByText("Validation", { exact: true })).toBeVisible();
    await expect(checklist.getByText("Article file", { exact: true })).toBeVisible();
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
