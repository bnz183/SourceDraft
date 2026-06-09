import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  collapseSlashes,
  fileExtension,
  hasFileExtension,
  trimLeadingSlashes,
  trimSlashes,
  trimTrailingSlashes,
} from "./path.js";

describe("path helpers", () => {
  it("trims leading slashes", () => {
    assert.equal(trimLeadingSlashes("///public/images"), "public/images");
    assert.equal(trimLeadingSlashes("public/images"), "public/images");
    assert.equal(trimLeadingSlashes(""), "");
  });

  it("trims trailing slashes", () => {
    assert.equal(trimTrailingSlashes("public/images///"), "public/images");
    assert.equal(trimTrailingSlashes("public/images"), "public/images");
  });

  it("trims both ends", () => {
    assert.equal(trimSlashes("///public/images///"), "public/images");
  });

  it("collapses repeated slashes", () => {
    assert.equal(collapseSlashes("/images//photo.png"), "/images/photo.png");
    assert.equal(collapseSlashes("///"), "/");
  });

  it("reads file extensions without regex", () => {
    assert.equal(fileExtension("post.mdx"), "mdx");
    assert.equal(fileExtension("archive.tar.gz"), "gz");
    assert.equal(fileExtension("no-extension"), "");
    assert.equal(hasFileExtension("post.md", ["md", "mdx"]), true);
    assert.equal(hasFileExtension("post.txt", ["md", "mdx"]), false);
  });
});
