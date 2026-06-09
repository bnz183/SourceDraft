import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  derivePublicMediaPath,
  joinPublicMediaPath,
  normalizePublicMediaPath,
} from "./publicMediaPath.js";

describe("publicMediaPath", () => {
  it("normalizes trailing slashes and empty values", () => {
    assert.equal(normalizePublicMediaPath("/images///"), "/images");
    assert.equal(normalizePublicMediaPath("images"), "/images");
    assert.equal(normalizePublicMediaPath("   "), "/");
  });

  it("derives public paths from mediaDir", () => {
    assert.equal(derivePublicMediaPath("public/images"), "/images");
    assert.equal(derivePublicMediaPath("src/assets/images"), "/images");
    assert.equal(derivePublicMediaPath(""), "/media");
  });

  it("joins filenames without duplicate slashes", () => {
    assert.equal(joinPublicMediaPath("/images", "photo.png"), "/images/photo.png");
    assert.equal(joinPublicMediaPath("/images/", "/photo.png"), "/images/photo.png");
  });
});
