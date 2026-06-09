import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isPrPublishMode,
  isPublishMode,
  parsePublishMode,
  publishModeSummary,
} from "./publishMode.js";

describe("publish mode", () => {
  it("parses supported publish modes", () => {
    assert.equal(parsePublishMode("direct"), "direct");
    assert.equal(parsePublishMode(" pull-request "), "pull-request");
    assert.equal(parsePublishMode("draft-pull-request"), "draft-pull-request");
    assert.equal(parsePublishMode("invalid"), null);
  });

  it("identifies PR publish modes", () => {
    assert.equal(isPublishMode("direct"), true);
    assert.equal(isPrPublishMode("pull-request"), true);
    assert.equal(isPrPublishMode("draft-pull-request"), true);
    assert.equal(isPrPublishMode("direct"), false);
  });

  it("summarizes supported modes", () => {
    assert.match(publishModeSummary(), /direct/);
    assert.match(publishModeSummary(), /pull-request/);
  });
});
