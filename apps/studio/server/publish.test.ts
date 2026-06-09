import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { publishDemoArticle } from "./demoPublish.js";
import { loadPublicConfig } from "./config.js";
import { resetDemoStore } from "./demoStore.js";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("publish API modes", () => {
  it("rejects unsupported publish mode in demo", async () => {
    resetDemoStore();
    const runtime = loadPublicConfig();
    const result = await publishDemoArticle(
      {
        title: "Mode test",
        slug: "mode-test",
        description: "Validates unsupported publish mode handling.",
        pubDate: "2026-06-08",
        category: "Guides",
        tags: ["demo"],
        draft: false,
        body: "# Mode test\n\nBody.",
        publishMode: "fast-lane",
      },
      runtime,
    );

    assert.equal(result.status, 400);
    assert.equal(result.body.ok, false);
    if (!result.body.ok) {
      assert.match(result.body.error, /Unsupported publish mode/);
    }
  });

  it("simulates pull-request publish in demo mode", async () => {
    resetDemoStore();
    const runtime = loadPublicConfig();
    const result = await publishDemoArticle(
      {
        title: "PR demo test",
        slug: "pr-demo-test",
        description: "Validates demo PR publish response shape.",
        pubDate: "2026-06-08",
        category: "Guides",
        tags: ["demo"],
        draft: false,
        body: "# PR demo test\n\nBody.",
        publishMode: "pull-request",
      },
      runtime,
    );

    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
    if (result.body.ok) {
      assert.equal(result.body.publishMode, "pull-request");
      assert.equal(result.body.prBranch, "sourcedraft/pr-demo-test");
      assert.equal(result.body.baseBranch, runtime.branch);
      assert.match(result.body.prUrl ?? "", /\/pull\/101$/u);
      assert.equal(result.body.deployHookNote, "PR created; deploy hook not triggered until merge.");
    }
  });

  it("rejects PR mode for non-GitHub publishers", async () => {
    resetDemoStore();
    const runtime = {
      ...loadPublicConfig(),
      publisher: "wordpress" as const,
      publishMode: "direct" as const,
      prBranchPrefix: "sourcedraft/",
      prDraft: false,
    };

    const result = await publishDemoArticle(
      {
        title: "Unsupported PR mode",
        slug: "unsupported-pr-mode",
        description: "Validates unsupported publisher handling.",
        pubDate: "2026-06-08",
        category: "Guides",
        tags: ["demo"],
        draft: false,
        body: "# Unsupported\n\nBody.",
        publishMode: "pull-request",
      },
      runtime,
    );

    assert.equal(result.status, 400);
    assert.equal(result.body.ok, false);
    if (!result.body.ok) {
      assert.match(result.body.error, /only supported for the GitHub publisher/i);
    }
  });

  it("loads publish mode from env", () => {
    process.env.SOURCEDRAFT_PUBLISH_MODE = "pull-request";
    process.env.SOURCEDRAFT_PR_BRANCH_PREFIX = "custom/";
    process.env.SOURCEDRAFT_PR_DRAFT = "true";

    const runtime = loadPublicConfig();
    assert.equal(runtime.publishMode, "draft-pull-request");
    assert.equal(runtime.prBranchPrefix, "custom/");
    assert.equal(runtime.prDraft, true);
  });
});
