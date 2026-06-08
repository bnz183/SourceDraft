import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSetupHealth } from "./setupHealth.js";

describe("setup health", () => {
  it("returns safe diagnostics without secrets", () => {
    const report = getSetupHealth();

    assert.equal(typeof report.adminPasswordConfigured, "boolean");
    assert.equal(typeof report.githubTokenConfigured, "boolean");
    assert.equal(typeof report.demoModeAvailable, "boolean");
    assert.ok(Array.isArray(report.checks));
    assert.ok(report.checks.length >= 8);

    const serialized = JSON.stringify(report);
    assert.doesNotMatch(serialized, /ghp_/u);
    assert.doesNotMatch(serialized, /GITHUB_TOKEN=/u);
  });

  it("includes a next action when setup is incomplete", () => {
    const report = getSetupHealth();
    if (!report.githubReady && !report.demoModeForced) {
      assert.ok(report.nextAction);
    }
  });
});
