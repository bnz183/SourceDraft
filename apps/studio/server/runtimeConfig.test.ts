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

  it("accepts gitlab publisher when credentials are set", () => {
    process.env.CMS_PUBLISHER = "gitlab";
    process.env.GITLAB_TOKEN = "gl-token";
    process.env.GITLAB_PROJECT_PATH = "group/site";
    process.env.GITLAB_BRANCH = "main";

    const result = loadPublishEnv();
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.config.publisher, "gitlab");
      assert.equal(result.config.gitlabProjectRef, "group/site");
    }
  });

  it("accepts bitbucket publisher when credentials are set", () => {
    process.env.CMS_PUBLISHER = "bitbucket";
    process.env.BITBUCKET_TOKEN = "bb-token";
    process.env.BITBUCKET_WORKSPACE = "acme";
    process.env.BITBUCKET_REPO_SLUG = "blog";

    const result = loadPublishEnv();
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.config.publisher, "bitbucket");
      assert.equal(result.config.owner, "acme");
      assert.equal(result.config.repo, "blog");
    }
  });

  it("accepts wordpress publisher when credentials are set", () => {
    process.env.CMS_PUBLISHER = "wordpress";
    process.env.WORDPRESS_API_URL = "https://example.com/wp-json";
    process.env.WORDPRESS_USERNAME = "editor";
    process.env.WORDPRESS_APP_PASSWORD = "abcd EFGH ijkl MNOP qrst UVWX";

    const result = loadPublishEnv();
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.config.publisher, "wordpress");
      assert.equal(result.config.wordpressApiUrl, "https://example.com/wp-json");
    }
  });

  it("accepts ghost publisher when credentials are set", () => {
    process.env.CMS_PUBLISHER = "ghost";
    process.env.GHOST_ADMIN_URL = "https://example.com";
    process.env.GHOST_ADMIN_API_KEY = "id:secret";

    const result = loadPublishEnv();
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.config.publisher, "ghost");
      assert.equal(result.config.ghostAdminUrl, "https://example.com");
    }
  });

  it("rejects gitlab publisher without project reference", () => {
    process.env.CMS_PUBLISHER = "gitlab";
    process.env.GITLAB_TOKEN = "gl-token";
    delete process.env.GITLAB_PROJECT_ID;
    delete process.env.GITLAB_PROJECT_PATH;

    const result = loadPublishEnv();
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /GITLAB_PROJECT/);
    }
  });
});
