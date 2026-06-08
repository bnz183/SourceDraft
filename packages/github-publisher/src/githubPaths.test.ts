import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { encodeRepoPath, normalizeRepoPath } from "./githubPaths.js";

describe("normalizeRepoPath", () => {
  it("strips leading slashes and whitespace", () => {
    assert.equal(normalizeRepoPath(" /src/content/blog/ "), "src/content/blog/");
  });
});

describe("encodeRepoPath", () => {
  it("encodes path segments for GitHub API URLs", () => {
    assert.equal(encodeRepoPath("src/content/blog/post.mdx"), "src/content/blog/post.mdx");
    assert.equal(encodeRepoPath("images/my photo.png"), "images/my%20photo.png");
  });
});
