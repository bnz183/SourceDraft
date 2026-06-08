import { expect, test, type Page } from "@playwright/test";

function attachPageErrorLogging(page: Page): void {
  page.on("pageerror", (error) => {
    console.error("Page error:", error.message);
  });
}

async function waitForStudioRoot(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.locator("#root")).not.toBeEmpty({ timeout: 30_000 });
}

async function enterDemoMode(page: Page): Promise<void> {
  attachPageErrorLogging(page);
  await waitForStudioRoot(page);
  await expect(page.getByRole("heading", { name: "SourceDraft Studio" })).toBeVisible();
  await page.getByRole("button", { name: "Explore demo mode" }).click();
  await expect(page.getByText("Demo mode — no GitHub commits are made")).toBeVisible();
}

test.describe("Studio smoke", () => {
  test("login/demo entry renders", async ({ page }) => {
    attachPageErrorLogging(page);
    await waitForStudioRoot(page);
    await expect(page.getByRole("heading", { name: "SourceDraft Studio" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Explore demo mode" })).toBeVisible();
  });

  test("overview/post list renders in demo mode", async ({ page }) => {
    await enterDemoMode(page);
    await expect(page.getByRole("heading", { name: "Posts" })).toBeVisible();
    await expect(page.getByText("Getting started with SourceDraft")).toBeVisible();
  });

  test("new post form and editor accept text", async ({ page }) => {
    await enterDemoMode(page);
    await page.getByRole("button", { name: "New post" }).click();
    await page.getByPlaceholder("Post title").fill("Smoke test post");
    await page.getByPlaceholder("Short description or subtitle").fill(
      "A short summary for the smoke test post.",
    );
    const body = page.locator(".writing-canvas__body");
    await body.fill("## Smoke test section\n\nBody text for smoke testing.");
    await expect(body).toHaveValue(/Smoke test section/u);
  });

  test("toolbar inserts Markdown", async ({ page }) => {
    await enterDemoMode(page);
    await page.getByRole("button", { name: "New post" }).click();
    const body = page.locator(".writing-canvas__body");
    await body.fill("Selected text");
    await body.selectText();
    await page.getByRole("button", { name: "Bold" }).click();
    await expect(body).toHaveValue("**Selected text**");
  });

  test("autosave status appears after edits", async ({ page }) => {
    await enterDemoMode(page);
    await page.getByRole("button", { name: "New post" }).click();
    await page.getByPlaceholder("Post title").fill("Autosave smoke test");
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
    await expect(page.getByRole("heading", { name: "Setup health" })).toBeVisible();
    await expect(page.getByText("Admin password")).toBeVisible();
    await expect(page.getByText("GitHub token (server-side)")).toBeVisible();
  });

  test("publish success can be simulated in demo mode", async ({ page }) => {
    await enterDemoMode(page);
    await page.getByRole("button", { name: "New post" }).click();
    await page.getByPlaceholder("Post title").fill("Demo publish smoke test");
    await page.getByPlaceholder("Short description or subtitle").fill(
      "Summary for demo publish smoke test.",
    );
    await page.locator(".writing-canvas__body").fill("# Demo publish\n\nBody content.");
    await page.getByRole("button", { name: "Simulate publish" }).click();
    await expect(page.getByText("Publish simulated")).toBeVisible({ timeout: 10_000 });
  });
});
