import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  unsupportedListPosts,
  unsupportedPublishArticle,
  unsupportedReadPost,
  unsupportedUploadMedia,
} from "./unsupported.js";

describe("unsupported publisher methods", () => {
  it("returns clear errors for unsupported capabilities", () => {
    const upload = unsupportedUploadMedia("github");
    assert.equal(upload.ok, false);
    if (!upload.ok) {
      assert.match(upload.error, /does not support media uploads/);
    }

    const publish = unsupportedPublishArticle("github");
    assert.match(
      publish.ok ? "" : publish.error,
      /does not support article publishing/,
    );

    const list = unsupportedListPosts("github");
    assert.match(list.ok ? "" : list.error, /does not support listing posts/);

    const read = unsupportedReadPost("github");
    assert.match(read.ok ? "" : read.error, /does not support reading posts/);
  });
});
