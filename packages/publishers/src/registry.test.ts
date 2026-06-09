import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createPublisher,
  isPublisherId,
  listPublisherIds,
  publisherRegistry,
} from "./publisherRegistry.js";
import type { PublisherRuntimeConfig } from "./types.js";

import "./registerBuiltInPublishers.js";

const runtimeConfig: PublisherRuntimeConfig = {
  token: "test-token",
  owner: "owner",
  repo: "repo",
  branch: "main",
  contentDir: "src/content/blog",
  mediaDir: "public/images",
};

describe("publisher registry", () => {
  it("defaults to github publisher", () => {
    assert.deepEqual(listPublisherIds(), ["github"]);
    assert.equal(isPublisherId("github"), true);
    assert.equal(isPublisherId("wordpress"), false);
  });

  it("creates github publisher with full capabilities", () => {
    const publisher = createPublisher("github", runtimeConfig);

    assert.equal(publisher.id, "github");
    assert.equal(publisher.capabilities.publishArticle, true);
    assert.equal(publisher.capabilities.uploadMedia, true);
    assert.equal(publisher.capabilities.listPosts, true);
    assert.equal(publisher.capabilities.readPost, true);
  });

  it("exposes registry helpers", () => {
    assert.equal(publisherRegistry.isKnown("github"), true);
    assert.match(publisherRegistry.supportedSummary(), /github/);
  });
});
