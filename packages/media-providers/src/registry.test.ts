import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createMediaProvider,
  isMediaProviderId,
  listMediaProviderIds,
} from "./mediaProviderRegistry.js";
import type { MediaProviderRuntimeConfig } from "./types.js";

import "./registerBuiltInMediaProviders.js";

const baseConfig: MediaProviderRuntimeConfig = {
  mediaDir: "public/images",
  publicMediaPath: "/images",
};

describe("media provider registry", () => {
  it("registers built-in media providers", () => {
    assert.deepEqual(listMediaProviderIds(), [
      "github-media",
      "cloudinary",
      "s3-compatible",
    ]);
    assert.equal(isMediaProviderId("github-media"), true);
    assert.equal(isMediaProviderId("cloudinary"), true);
    assert.equal(isMediaProviderId("s3-compatible"), true);
    assert.equal(isMediaProviderId("imgix"), false);
  });

  it("selects github-media provider by default factory id", () => {
    const provider = createMediaProvider("github-media", {
      ...baseConfig,
      publisherUpload: async () => ({
        ok: true,
        path: "public/images/test.png",
        sha: "sha",
        commitSha: "commit",
      }),
    });

    assert.equal(provider.id, "github-media");
  });
});
