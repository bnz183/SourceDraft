import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resetDemoStore } from "./demoStore.js";
import { listDemoPostsHandler, loadDemoPost } from "./demoPosts.js";
import { publishDemoArticle } from "./demoPublish.js";
import { loadPublicConfig } from "./config.js";

describe("demo mode", () => {
  it("lists sample posts from fixtures", async () => {
    resetDemoStore();
    const result = await listDemoPostsHandler();
    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
    if (result.body.ok) {
      assert.ok(result.body.posts.length >= 2);
    }
  });

  it("loads a sample post by path", async () => {
    resetDemoStore();
    const runtime = loadPublicConfig();
    const result = await loadDemoPost(
      "src/content/blog/getting-started-with-sourcedraft.mdx",
      runtime,
    );
    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
  });

  it("simulates publish without GitHub credentials", async () => {
    resetDemoStore();
    const runtime = loadPublicConfig();
    const result = await publishDemoArticle(
      {
        title: "Demo publish test",
        slug: "demo-publish-test",
        description: "A short demo publish test post.",
        pubDate: "2026-06-08",
        category: "Guides",
        tags: ["demo"],
        draft: false,
        body: "# Demo publish test\n\nPublished in demo mode only.",
      },
      runtime,
    );

    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
    if (result.body.ok) {
      assert.match(result.body.commitSha, /^demo/u);
    }
  });
});
