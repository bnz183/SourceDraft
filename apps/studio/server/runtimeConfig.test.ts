import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { normalizeSourceDraftConfig } from "@sourcedraft/config";
import { loadPublishEnv } from "./config.js";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("runtime config resolution", () => {
  it("defaults adapter and publisher from project config", () => {
    const project = normalizeSourceDraftConfig({
      adapter: "markdown",
      publisher: "github",
    });

    assert.equal(project.adapter, "markdown");
    assert.equal(project.publisher, "github");
  });

  it("rejects unknown adapter with a clear error", () => {
    process.env.GITHUB_TOKEN = "token";
    process.env.GITHUB_OWNER = "owner";
    process.env.GITHUB_REPO = "repo";
    process.env.CMS_ADAPTER = "wordpress";

    const result = loadPublishEnv();
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /Unsupported adapter "wordpress"/);
    }
  });

  it("rejects unknown publisher with a clear error", () => {
    process.env.GITHUB_TOKEN = "token";
    process.env.GITHUB_OWNER = "owner";
    process.env.GITHUB_REPO = "repo";
    process.env.CMS_PUBLISHER = "ghost-api";

    const result = loadPublishEnv();
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /Unsupported publisher "ghost-api"/);
    }
  });

  it("accepts default github publisher when credentials are set", () => {
    process.env.GITHUB_TOKEN = "token";
    process.env.GITHUB_OWNER = "owner";
    process.env.GITHUB_REPO = "repo";
    process.env.CMS_ADAPTER = "astro-mdx";
    process.env.CMS_PUBLISHER = "github";

    const result = loadPublishEnv();
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.config.adapter, "astro-mdx");
      assert.equal(result.config.publisher, "github");
    }
  });
});
