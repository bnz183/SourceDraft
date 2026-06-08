import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Article } from "@sourcedraft/core";
import {
  adapterRegistry,
  getAdapterPostPath,
  getAdapterPreviewMeta,
  isAdapterId,
  listAdapterIds,
  renderAdapterOutput,
} from "./registry.js";

const article: Article = {
  title: "Registry test",
  slug: "registry-test",
  description: "Adapter registry smoke test",
  pubDate: "2024-06-01",
  category: "Guides",
  tags: ["test"],
  draft: false,
  body: "Body text.",
};

describe("adapter registry", () => {
  it("lists all built-in adapters", () => {
    assert.equal(listAdapterIds().length, 8);
    assert.equal(isAdapterId("docusaurus-mdx"), true);
    assert.equal(isAdapterId("mkdocs-markdown"), true);
    assert.equal(isAdapterId("nuxt-content-markdown"), true);
  });

  it("validates adapter ids", () => {
    assert.equal(isAdapterId("nextjs-mdx"), true);
    assert.equal(isAdapterId("wordpress"), false);
  });

  it("exposes adapterRegistry helpers", () => {
    assert.equal(adapterRegistry.isKnown("markdown"), true);
    assert.match(adapterRegistry.supportedSummary(), /astro-mdx/);
  });

  it("renders and resolves paths through registry", () => {
    const output = renderAdapterOutput("nextjs-mdx", article);
    assert.match(output, /date: 2024-06-01/);

    const path = getAdapterPostPath("nextjs-mdx", article, {
      contentDir: "content/posts",
    });
    assert.equal(path, "content/posts/registry-test.mdx");

    const preview = getAdapterPreviewMeta("hugo-markdown");
    assert.equal(preview.extension, "md");
    assert.match(preview.label, /Hugo/);
  });
});
