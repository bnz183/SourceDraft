import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSlug, isValidSlug } from "./slug.js";

describe("createSlug", () => {
  it("lowercases and hyphenates a title", () => {
    assert.equal(createSlug("Hello World"), "hello-world");
  });

  it("strips diacritics", () => {
    assert.equal(createSlug("Café Guide"), "cafe-guide");
  });

  it("collapses repeated separators", () => {
    assert.equal(createSlug("foo---bar"), "foo-bar");
  });

  it("returns empty string for non-alphanumeric input", () => {
    assert.equal(createSlug("!!!"), "");
  });
});

describe("isValidSlug", () => {
  it("accepts lowercase hyphenated slugs", () => {
    assert.equal(isValidSlug("hello-world"), true);
    assert.equal(isValidSlug("post-2024"), true);
  });

  it("rejects invalid slugs", () => {
    assert.equal(isValidSlug("Hello-World"), false);
    assert.equal(isValidSlug("-leading"), false);
    assert.equal(isValidSlug("trailing-"), false);
    assert.equal(isValidSlug("double--hyphen"), false);
  });
});
