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

const githubRuntimeConfig: PublisherRuntimeConfig = {
  token: "test-token",
  owner: "owner",
  repo: "repo",
  branch: "main",
  contentDir: "src/content/blog",
  mediaDir: "public/images",
};

const gitlabRuntimeConfig: PublisherRuntimeConfig = {
  ...githubRuntimeConfig,
  gitlabProjectRef: "group/site",
  gitlabBaseUrl: "https://gitlab.com",
};

const bitbucketRuntimeConfig: PublisherRuntimeConfig = {
  ...githubRuntimeConfig,
  owner: "acme",
  repo: "blog",
};

const wordpressRuntimeConfig: PublisherRuntimeConfig = {
  ...githubRuntimeConfig,
  token: "",
  owner: "",
  repo: "",
  wordpressApiUrl: "https://example.com/wp-json",
  wordpressUsername: "editor",
  wordpressAppPassword: "app-password",
  wordpressDefaultStatus: "draft",
};

const ghostRuntimeConfig: PublisherRuntimeConfig = {
  ...githubRuntimeConfig,
  token: "",
  owner: "",
  repo: "",
  ghostAdminUrl: "https://example.com",
  ghostAdminApiKey: "abc:a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
  ghostAcceptVersion: "v5.126",
  ghostDefaultStatus: "draft",
};

describe("publisher registry", () => {
  it("registers built-in publishers", () => {
    assert.deepEqual(listPublisherIds(), [
      "github",
      "gitlab",
      "bitbucket",
      "wordpress",
      "ghost",
    ]);
    assert.equal(isPublisherId("github"), true);
    assert.equal(isPublisherId("gitlab"), true);
    assert.equal(isPublisherId("bitbucket"), true);
    assert.equal(isPublisherId("wordpress"), true);
    assert.equal(isPublisherId("ghost"), true);
    assert.equal(isPublisherId("drupal"), false);
  });

  it("creates github publisher with full capabilities", () => {
    const publisher = createPublisher("github", githubRuntimeConfig);

    assert.equal(publisher.id, "github");
    assert.equal(publisher.kind, "git");
    assert.equal(publisher.capabilities.publishArticle, true);
    assert.equal(publisher.capabilities.uploadMedia, true);
    assert.equal(publisher.capabilities.listPosts, true);
    assert.equal(publisher.capabilities.readPost, true);
  });

  it("creates gitlab publisher with repository file API capabilities", () => {
    const publisher = createPublisher("gitlab", gitlabRuntimeConfig);

    assert.equal(publisher.id, "gitlab");
    assert.equal(publisher.kind, "git");
    assert.equal(publisher.capabilities.publishArticle, true);
    assert.equal(publisher.capabilities.uploadMedia, true);
    assert.equal(publisher.capabilities.listPosts, true);
    assert.equal(publisher.capabilities.readPost, true);
  });

  it("creates bitbucket publisher with commit-upload capabilities", () => {
    const publisher = createPublisher("bitbucket", bitbucketRuntimeConfig);

    assert.equal(publisher.id, "bitbucket");
    assert.equal(publisher.kind, "git");
    assert.equal(publisher.capabilities.publishArticle, true);
    assert.equal(publisher.capabilities.uploadMedia, true);
    assert.equal(publisher.capabilities.listPosts, false);
    assert.equal(publisher.capabilities.readPost, false);
  });

  it("creates wordpress remote CMS publisher", () => {
    const publisher = createPublisher("wordpress", wordpressRuntimeConfig);

    assert.equal(publisher.id, "wordpress");
    assert.equal(publisher.kind, "remote-cms");
    assert.equal(publisher.capabilities.publishArticle, true);
    assert.equal(publisher.capabilities.uploadMedia, false);
    assert.equal(publisher.capabilities.listPosts, false);
  });

  it("creates ghost remote CMS publisher", () => {
    const publisher = createPublisher("ghost", ghostRuntimeConfig);

    assert.equal(publisher.id, "ghost");
    assert.equal(publisher.kind, "remote-cms");
    assert.equal(publisher.capabilities.publishArticle, true);
    assert.equal(publisher.capabilities.uploadMedia, false);
  });

  it("exposes registry helpers", () => {
    assert.equal(publisherRegistry.isKnown("github"), true);
    assert.match(publisherRegistry.supportedSummary(), /github/);
    assert.match(publisherRegistry.supportedSummary(), /gitlab/);
    assert.match(publisherRegistry.supportedSummary(), /bitbucket/);
  });
});
