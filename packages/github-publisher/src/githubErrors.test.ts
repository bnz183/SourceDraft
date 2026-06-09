import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  branchProtectionRecommendation,
  directoryListingLimitMessage,
  formatGitHubApiError,
  formatLocalGitHubError,
  isBranchProtectionError,
  isDirectoryListingTruncated,
  validateGitHubFileBody,
} from "./githubErrors.js";

describe("formatGitHubApiError", () => {
  it("maps 401 to token guidance", () => {
    const error = formatGitHubApiError(401, "Bad credentials", "publish");
    assert.match(error, /GITHUB_TOKEN/);
  });

  it("maps 403 to scope guidance", () => {
    const error = formatGitHubApiError(403, "Forbidden", "listPosts", {
      owner: "acme",
      repo: "blog",
    });
    assert.match(error, /acme\/blog/);
    assert.match(error, /403/);
  });

  it("recommends pull-request mode for protected branch publish failures", () => {
    assert.equal(
      isBranchProtectionError(403, "Branch main is protected"),
      true,
    );

    const error = formatGitHubApiError(
      422,
      "Required status check expected",
      "publish",
      { owner: "acme", repo: "blog" },
    );
    assert.match(error, /SOURCEDRAFT_PUBLISH_MODE/);
    assert.equal(
      branchProtectionRecommendation(422, "unsigned commits are not allowed"),
      " Direct publish to a protected branch failed. Try pull-request or draft-pull-request publish mode (SOURCEDRAFT_PUBLISH_MODE).",
    );
  });

  it("maps rate limit 403 messages without regex", () => {
    const error = formatGitHubApiError(403, "API rate limit exceeded", "publish");
    assert.match(error, /rate limit/i);
  });

  it("maps repository-not-found 404 messages without regex", () => {
    const error = formatGitHubApiError(404, "Repository not found", "publish", {
      owner: "acme",
      repo: "blog",
    });
    assert.match(error, /GITHUB_OWNER/);
  });

  it("maps listPosts 404 to contentDir guidance", () => {
    const error = formatGitHubApiError(404, "Not Found", "listPosts", {
      owner: "acme",
      repo: "blog",
      contentDir: "src/content/blog",
    });
    assert.match(error, /src\/content\/blog/);
    assert.match(error, /contentDir/);
  });

  it("maps uploadMedia 404 to mediaDir guidance", () => {
    const error = formatGitHubApiError(404, "Not Found", "uploadMedia", {
      mediaDir: "public/images",
    });
    assert.match(error, /public\/images/);
    assert.match(error, /mediaDir/);
  });
});

describe("validateGitHubFileBody", () => {
  it("rejects directory paths", () => {
    assert.equal(validateGitHubFileBody({ type: "dir", sha: "abc" }), "Path is not a file.");
  });

  it("rejects large files without inline content", () => {
    const error = validateGitHubFileBody({
      type: "file",
      sha: "abc",
      size: 2_000_000,
    });
    assert.notEqual(error, null);
    assert.match(error as string, /too large/i);
  });

  it("accepts valid base64 file bodies", () => {
    assert.equal(
      validateGitHubFileBody({
        type: "file",
        sha: "abc",
        content: "aGVsbG8=",
        encoding: "base64",
      }),
      null,
    );
  });
});

describe("listing helpers", () => {
  it("detects truncated directory listings", () => {
    assert.equal(isDirectoryListingTruncated(999), false);
    assert.equal(isDirectoryListingTruncated(1000), true);
  });

  it("documents the listing limit honestly", () => {
    assert.match(directoryListingLimitMessage(), /Contents API/);
    assert.match(directoryListingLimitMessage(), /Git Trees API/);
  });
});

describe("formatLocalGitHubError", () => {
  it("rewrites not-a-file errors with path context", () => {
    const error = formatLocalGitHubError("Path is not a file.", "readPost", {
      path: "src/content/blog",
    });
    assert.match(error, /folder/);
  });
});
