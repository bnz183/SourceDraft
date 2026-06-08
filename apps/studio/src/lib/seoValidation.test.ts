import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createInitialFormState } from "./articleForm.js";
import { analyzeSeoFields } from "./seoValidation.js";

describe("analyzeSeoFields", () => {
  it("returns reading time and soft warnings", () => {
    const state = {
      ...createInitialFormState(),
      title: "Hello",
      body: "word ".repeat(250).trim(),
      heroImage: "/images/cover.png",
      metaDescription: "d".repeat(200),
    };

    const result = analyzeSeoFields(state);
    assert.ok(result.readingTimeMinutes >= 2);
    assert.ok(result.warnings.some((warning) => warning.id === "cover-alt-missing"));
    assert.ok(
      result.warnings.some((warning) => warning.id === "meta-description-long"),
    );
  });
});
