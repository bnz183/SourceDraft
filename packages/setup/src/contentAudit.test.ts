import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  auditPostFile,
  buildContentAuditReport,
} from "./contentAudit.js";
import { hasComplexMdx } from "./mdxComplexity.js";

const VALID_POST = `---
title: Hello world
description: A valid summary
pubDate: 2024-06-01
category: Guides
tags:
  - one
draft: false
---

## Section

Body text.
`;

describe("content audit", () => {
  it("accepts valid astro posts", () => {
    const audited = auditPostFile(
      { path: "src/content/blog/hello.mdx", content: VALID_POST },
      "astro-mdx",
    );

    assert.equal(audited.status, "valid");
    assert.equal(audited.slug, "hello");
    assert.equal(audited.issues.length, 0);
  });

  it("reports missing required frontmatter fields", () => {
    const audited = auditPostFile(
      {
        path: "src/content/blog/incomplete.mdx",
        content: "---\ntitle: Incomplete\n---\n\nBody",
      },
      "astro-mdx",
    );

    assert.equal(audited.status, "invalid");
    assert.ok(audited.issues.some((issue) => issue.kind === "missing-field"));
  });

  it("detects duplicate slugs across files", () => {
    const withSlug = VALID_POST.replace(
      "title: Hello world",
      "title: Hello world\nslug: shared-slug",
    );
    const report = buildContentAuditReport(
      [
        { path: "src/content/blog/a.mdx", content: withSlug },
        {
          path: "src/content/blog/b.mdx",
          content: withSlug.replace("Hello world", "Other title"),
        },
      ],
      "astro-mdx",
      "src/content/blog",
    );

    assert.equal(report.duplicateSlugs.length, 1);
    assert.equal(report.duplicateSlugs[0]?.slug, "shared-slug");
  });

  it("flags complex MDX as source-only", () => {
    const content = `${VALID_POST.replace("## Section", "<Callout>Hi</Callout>")}`;
    assert.equal(hasComplexMdx(content), true);

    const audited = auditPostFile(
      { path: "src/content/blog/mdx.mdx", content },
      "astro-mdx",
    );

    assert.equal(audited.status, "source-only");
    assert.ok(audited.issues.some((issue) => issue.kind === "complex-mdx"));
  });

  it("ignores non-markdown files in audit report", () => {
    const report = buildContentAuditReport(
      [{ path: "src/content/blog/readme.txt", content: "plain" }],
      "astro-mdx",
      "src/content/blog",
    );

    assert.equal(report.summary.ignoredCount, 1);
    assert.equal(report.validPosts.length, 0);
  });

  it("reports invalid publication dates", () => {
    const audited = auditPostFile(
      {
        path: "src/content/blog/bad-date.mdx",
        content: VALID_POST.replace("pubDate: 2024-06-01", "pubDate: not-a-date"),
      },
      "astro-mdx",
    );

    assert.ok(audited.issues.some((issue) => issue.kind === "invalid-date"));
  });
});
