import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { resolveMediaProviderId } from "./mediaProviderRuntime.js";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("media provider selection", () => {
  it("defaults to github-media", () => {
    delete process.env.CMS_MEDIA_PROVIDER;
    assert.equal(resolveMediaProviderId(), "github-media");
  });

  it("selects cloudinary when configured", () => {
    process.env.CMS_MEDIA_PROVIDER = "cloudinary";
    assert.equal(resolveMediaProviderId(), "cloudinary");
  });

  it("falls back to github-media for unknown providers", () => {
    process.env.CMS_MEDIA_PROVIDER = "imgix";
    assert.equal(resolveMediaProviderId(), "github-media");
  });
});
