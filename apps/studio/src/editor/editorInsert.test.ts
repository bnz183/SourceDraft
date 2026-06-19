import assert from "node:assert/strict";
import { test } from "node:test";
import { fileLabelFromPath, hasUrl, normalizeUrl } from "./editorInsert.ts";

test("normalizeUrl keeps absolute and protocol URLs", () => {
  assert.equal(normalizeUrl("https://example.com"), "https://example.com");
  assert.equal(normalizeUrl("http://example.com/x"), "http://example.com/x");
  assert.equal(normalizeUrl("mailto:a@b.com"), "mailto:a@b.com");
  assert.equal(normalizeUrl("tel:+15551234"), "tel:+15551234");
});

test("normalizeUrl keeps relative paths and anchors", () => {
  assert.equal(normalizeUrl("/post/hello/"), "/post/hello/");
  assert.equal(normalizeUrl("#section"), "#section");
  assert.equal(normalizeUrl("./local.md"), "./local.md");
  assert.equal(normalizeUrl("../up.md"), "../up.md");
});

test("normalizeUrl adds https:// to bare domains", () => {
  assert.equal(normalizeUrl("example.com"), "https://example.com");
  assert.equal(normalizeUrl("example.com/path?q=1"), "https://example.com/path?q=1");
  assert.equal(normalizeUrl("sub.example.co.uk"), "https://sub.example.co.uk");
});

test("normalizeUrl trims and handles blanks", () => {
  assert.equal(normalizeUrl("  https://x.com  "), "https://x.com");
  assert.equal(normalizeUrl(""), "");
  assert.equal(normalizeUrl("   "), "");
});

test("normalizeUrl leaves plain text untouched", () => {
  assert.equal(normalizeUrl("not a url"), "not a url");
});

test("hasUrl reflects whether a URL would be inserted", () => {
  assert.equal(hasUrl(""), false);
  assert.equal(hasUrl("   "), false);
  assert.equal(hasUrl("example.com"), true);
  assert.equal(hasUrl("/x"), true);
});

test("fileLabelFromPath strips directories and .pdf", () => {
  assert.equal(fileLabelFromPath("/files/report.pdf"), "report");
  assert.equal(fileLabelFromPath("report.PDF"), "report");
  assert.equal(fileLabelFromPath("/docs/spec"), "spec");
  assert.equal(fileLabelFromPath("guide"), "guide");
});
