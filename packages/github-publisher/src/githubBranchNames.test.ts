import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  branchNameFromSlug,
  sanitizeBranchSegment,
  slugFromRepoPath,
} from "./githubBranchNames.js";

describe("github branch names", () => {
  it("sanitizes unsafe slug segments", () => {
    assert.equal(sanitizeBranchSegment("Hello World!"), "hello-world");
    assert.equal(sanitizeBranchSegment("---"), "post");
  });

  it("builds deterministic sourcedraft branches", () => {
    assert.equal(branchNameFromSlug("my-post"), "sourcedraft/my-post");
    assert.equal(branchNameFromSlug("my-post", "custom/"), "custom/my-post");
  });

  it("derives slug segments from repo paths", () => {
    assert.equal(
      slugFromRepoPath("src/content/blog/my-post.mdx"),
      "my-post",
    );
  });
});
