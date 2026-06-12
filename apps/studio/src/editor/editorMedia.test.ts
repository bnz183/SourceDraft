import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { attachmentLabel } from "./editorMedia.js";

describe("editorMedia", () => {
  it("derives attachment labels from filenames", () => {
    assert.equal(attachmentLabel("quarterly-report.pdf"), "quarterly-report");
    assert.equal(attachmentLabel("notes"), "notes");
  });
});
