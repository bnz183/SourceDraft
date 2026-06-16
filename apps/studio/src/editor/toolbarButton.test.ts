import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isToolbarButtonEnabled } from "./toolbarButton.js";

describe("isToolbarButtonEnabled", () => {
  it("enables a non-disabled button in rich mode", () => {
    assert.equal(isToolbarButtonEnabled(false, "rich"), true);
    assert.equal(isToolbarButtonEnabled(undefined, "rich"), true);
  });

  it("disables an individually-disabled button even in rich mode", () => {
    assert.equal(isToolbarButtonEnabled(true, "rich"), false);
  });

  it("disables every control in source mode", () => {
    assert.equal(isToolbarButtonEnabled(false, "source"), false);
    assert.equal(isToolbarButtonEnabled(undefined, "source"), false);
    assert.equal(isToolbarButtonEnabled(true, "source"), false);
  });
});
