import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeMediaPath } from "./mediaPaths.js";
import {
  isAllowedMediaFilename,
  matchesMediaSignature,
  maxBytesForMime,
  mediaKindFromExtension,
  mediaKindFromMime,
  normalizeExtension,
} from "./mediaValidation.js";

describe("media validation", () => {
  it("accepts allowed image and pdf mime types", () => {
    assert.equal(mediaKindFromMime("image/png"), "image");
    assert.equal(mediaKindFromMime("application/pdf"), "pdf");
    assert.equal(mediaKindFromMime("text/html"), null);
  });

  it("maps extensions to media kinds", () => {
    assert.equal(mediaKindFromExtension("webp"), "image");
    assert.equal(mediaKindFromExtension("pdf"), "pdf");
    assert.equal(mediaKindFromExtension("svg"), null);
  });

  it("enforces per-type upload limits", () => {
    assert.equal(maxBytesForMime("image/png"), 5 * 1024 * 1024);
    assert.equal(maxBytesForMime("application/pdf"), 10 * 1024 * 1024);
  });

  it("validates file signatures for images and pdf", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
    assert.equal(matchesMediaSignature(png, "image/png"), true);

    const pdf = Buffer.from("%PDF-1.7\n");
    assert.equal(matchesMediaSignature(pdf, "application/pdf"), true);

    const html = Buffer.from("<html></html>");
    assert.equal(matchesMediaSignature(html, "image/png"), false);
  });

  it("rejects disallowed filenames", () => {
    assert.equal(isAllowedMediaFilename("photo.png"), true);
    assert.equal(isAllowedMediaFilename("notes.pdf"), true);
    assert.equal(isAllowedMediaFilename("script.svg"), false);
    assert.equal(isAllowedMediaFilename("page.html"), false);
    assert.equal(normalizeExtension("photo.PNG"), "png");
  });
});

describe("media paths", () => {
  it("allows safe paths inside mediaDir and blocks traversal", () => {
    const ok = safeMediaPath("public/images/photo-abc.png", "public/images");
    assert.equal(ok.ok, true);

    const traversal = safeMediaPath("public/images/../secret.png", "public/images");
    assert.equal(traversal.ok, false);

    const outside = safeMediaPath("public/other/photo.png", "public/images");
    assert.equal(outside.ok, false);

    const blocked = safeMediaPath("public/images/evil.svg", "public/images");
    assert.equal(blocked.ok, false);
  });
});
