import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { previewPrBranch } from "./prBranch.js";

describe("previewPrBranch", () => {
  it("builds a stable PR branch preview", () => {
    assert.equal(previewPrBranch("my-post", "sourcedraft/"), "sourcedraft/my-post");
    assert.equal(previewPrBranch("My Post!", "custom/"), "custom/my-post");
  });
});
