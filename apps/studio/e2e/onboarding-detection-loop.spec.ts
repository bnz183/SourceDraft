import { expect, test } from "@playwright/test";
import { enterDemoMode } from "./helpers.js";

const DETECT_GLOB = "**/api/setup/detect";

async function openWizardToDetectStep(page: import("@playwright/test").Page) {
  await enterDemoMode(page);
  await page
    .getByRole("button", { name: /Run setup wizard|Review setup wizard/ })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Welcome", level: 1 }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(
    page.getByRole("heading", { name: "Your site", level: 1 }),
  ).toBeVisible();
}

test.describe("Onboarding detect-site failure handling", () => {
  test("failed detection does not refetch in a loop", async ({ page }) => {
    let hits = 0;
    await page.route(DETECT_GLOB, async (route) => {
      hits += 1;
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: "{}",
      });
    });

    await openWizardToDetectStep(page);

    // Sit on the detect-site step and measure the request rate.
    const baseline = hits;
    await page.waitForTimeout(3000);
    const delta = hits - baseline;
    expect(
      delta,
      `expected at most 1 detect request while idle on a failed scan, saw ${delta}`,
    ).toBeLessThanOrEqual(1);

    // The failure must surface as a real error state, and Continue must be blocked.
    await expect(page.getByText("Could not scan your project")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  test("retry triggers exactly one refetch and recovers on success", async ({
    page,
  }) => {
    let hits = 0;
    let mode: "fail" | "pass" = "fail";
    await page.route(DETECT_GLOB, async (route) => {
      hits += 1;
      if (mode === "fail") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: "{}",
        });
        return;
      }
      await route.continue();
    });

    await openWizardToDetectStep(page);
    await expect(page.getByText("Could not scan your project")).toBeVisible();

    // Next call should reach the real backend and succeed.
    const before = hits;
    mode = "pass";
    await page.getByRole("button", { name: "Try again" }).click();

    // Recovery: error clears and a real detection result renders.
    await expect(page.getByText("Could not scan your project")).toBeHidden();
    const detected = page.getByText(/We found an? /);
    const notDetected = page.getByText("We could not detect your site");
    await expect(detected.or(notDetected)).toBeVisible({ timeout: 15_000 });

    // Exactly one additional request was made by the retry.
    expect(hits - before).toBe(1);
  });
});
