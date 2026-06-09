import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it } from "node:test";
import { loadPublicConfig } from "./config.js";
import {
  demoFixtureMediaCount,
  demoFixturePostCount,
  loadDemoMediaFixtures,
  loadDemoPostFixtures,
} from "./demo/loadFixtures.js";
import { listDemoPostsHandler } from "./demoPosts.js";
import { publishDemoArticle } from "./demoPublish.js";
import { listDemoPosts, resetDemoStore, upsertDemoPost } from "./demoStore.js";
import { getSetupHealth } from "./setupHealth.js";

describe("demo fixtures", () => {
  it("loads stable post fixtures on every call", () => {
    const first = loadDemoPostFixtures();
    const second = loadDemoPostFixtures();

    assert.equal(first.length, demoFixturePostCount());
    assert.equal(second.length, demoFixturePostCount());
    assert.deepEqual(
      first.map((post) => post.summary.slug),
      second.map((post) => post.summary.slug),
    );
  });

  it("includes a published guide, draft, image post, and linking post", () => {
    const posts = loadDemoPostFixtures();
    const slugs = new Set(posts.map((post) => post.summary.slug));

    assert.ok(slugs.has("getting-started-with-sourcedraft"));
    assert.ok(slugs.has("draft-release-notes"));
    assert.ok(slugs.has("publishing-with-images"));
    assert.ok(slugs.has("linking-and-outline"));

    const draft = posts.find((post) => post.summary.slug === "draft-release-notes");
    const guide = posts.find(
      (post) => post.summary.slug === "getting-started-with-sourcedraft",
    );
    const images = posts.find((post) => post.summary.slug === "publishing-with-images");
    const links = posts.find((post) => post.summary.slug === "linking-and-outline");

    assert.equal(draft?.summary.draft, true);
    assert.equal(guide?.summary.draft, false);
    assert.match(images?.content ?? "", /!\[[^\]]*\]\([^)]+\)/u);
    assert.match(links?.content ?? "", /\[Getting started with SourceDraft\]/u);
    assert.match(links?.content ?? "", /^## /mu);
  });

  it("loads stable media fixtures with required metadata", () => {
    const media = loadDemoMediaFixtures();

    assert.equal(media.length, demoFixtureMediaCount());
    assert.ok(media.length >= 2);

    for (const file of media) {
      assert.ok(file.repoPath.length > 0);
      assert.ok(file.publicPath.startsWith("/"));
      assert.ok(file.filename.length > 0);
      assert.ok(file.extension.length > 0);
      assert.ok(file.kind === "image" || file.kind === "pdf");
      assert.ok(file.size > 0);
    }
  });

  it("resetDemoStore reloads seed content after in-memory edits", async () => {
    resetDemoStore();
    const before = (await listDemoPostsHandler()).body;
    assert.equal(before.ok, true);
    if (!before.ok) {
      return;
    }

    const initialCount = before.posts.length;
    upsertDemoPost("src/content/blog/temp-demo-post.mdx", "---\ntitle: Temp\n---\n", {
      path: "src/content/blog/temp-demo-post.mdx",
      title: "Temp",
      slug: "temp-demo-post",
      pubDate: "2026-06-09",
      category: "Notes",
      draft: true,
    });
    assert.equal(listDemoPosts().length, initialCount + 1);

    resetDemoStore();
    assert.equal(listDemoPosts().length, initialCount);
    assert.equal(listDemoPosts().some((post) => post.slug === "temp-demo-post"), false);
  });

  it("demo publish does not use the GitHub publisher module", () => {
    const source = readFileSync(resolve(import.meta.dirname, "demoPublish.ts"), "utf8");
    assert.doesNotMatch(source, /@sourcedraft\/github-publisher/u);
  });

  it("simulates publish in demo without GitHub credentials", async () => {
    resetDemoStore();
    const runtime = loadPublicConfig();
    const result = await publishDemoArticle(
      {
        title: "Fixture publish test",
        slug: "fixture-publish-test",
        description: "Validates demo publish stays local to fixtures store.",
        pubDate: "2026-06-08",
        category: "Guides",
        tags: ["demo"],
        draft: false,
        body: "# Fixture publish test\n\nNo GitHub commit.",
      },
      runtime,
    );

    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
  });

  it("setup health diagnostics do not expose secrets", () => {
    const report = getSetupHealth();
    const serialized = JSON.stringify(report);

    assert.doesNotMatch(serialized, /ghp_/u);
    assert.doesNotMatch(serialized, /GITHUB_TOKEN=/u);
    assert.doesNotMatch(serialized, /SOURCEDRAFT_ADMIN_PASSWORD=/u);
  });
});
