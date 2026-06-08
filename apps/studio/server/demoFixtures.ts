import type { PostSummary } from "./posts.js";

export type DemoFixturePost = {
  summary: PostSummary;
  content: string;
};

export type DemoFixtureMedia = {
  repoPath: string;
  publicPath: string;
  filename: string;
  extension: string;
  kind: "image" | "pdf";
  size: number;
};

const CONTENT_DIR = "src/content/blog";
const MEDIA_DIR = "public/images";
const PUBLIC_MEDIA_PATH = "/images";

export const DEMO_FIXTURE_POSTS: DemoFixturePost[] = [
  {
    summary: {
      path: `${CONTENT_DIR}/getting-started-with-sourcedraft.mdx`,
      title: "Getting started with SourceDraft",
      slug: "getting-started-with-sourcedraft",
      pubDate: "2026-06-06",
      category: "Guides",
      draft: false,
    },
    content: `---
title: Getting started with SourceDraft
description: An example MDX post showing the file shape SourceDraft publishes to an Astro content folder.
pubDate: 2026-06-06
category: Guides
tags:
  - sourcedraft
  - astro
draft: false
---

# Getting started with SourceDraft

This sample post ships with demo mode so you can explore Studio without GitHub credentials.

## What SourceDraft handles

- Article metadata and slug
- MDX file path under contentDir
- Preview before publish

## Try editing

Change this body, use the Markdown toolbar, and simulate publish. No GitHub commits are made in demo mode.
`,
  },
  {
    summary: {
      path: `${CONTENT_DIR}/markdown-toolbar-tips.mdx`,
      title: "Markdown toolbar tips",
      slug: "markdown-toolbar-tips",
      pubDate: "2026-05-20",
      category: "Tutorials",
      draft: false,
    },
    content: `---
title: Markdown toolbar tips
description: Short guide to headings, links, and lists in the Studio editor.
pubDate: 2026-05-20
category: Tutorials
tags:
  - markdown
  - studio
draft: false
---

# Markdown toolbar tips

Use the toolbar above the body field for common Markdown patterns.

## Headings

Add H2 and H3 sections to build a clear document outline.

## Internal links

Link to other sample posts with the Internal link action.
`,
  },
  {
    summary: {
      path: `${CONTENT_DIR}/draft-release-notes.mdx`,
      title: "Draft release notes",
      slug: "draft-release-notes",
      pubDate: "2026-06-01",
      category: "Notes",
      draft: true,
    },
    content: `---
title: Draft release notes
description: A sample draft post for testing filters and draft badges.
pubDate: 2026-06-01
category: Notes
tags:
  - draft
draft: true
---

# Draft release notes

This post is marked as a draft in frontmatter. It appears in the post list with a draft badge.
`,
  },
];

export const DEMO_FIXTURE_MEDIA: DemoFixtureMedia[] = [
  {
    repoPath: `${MEDIA_DIR}/sample-cover.png`,
    publicPath: `${PUBLIC_MEDIA_PATH}/sample-cover.png`,
    filename: "sample-cover.png",
    extension: "png",
    kind: "image",
    size: 48_000,
  },
  {
    repoPath: `${MEDIA_DIR}/workflow-diagram.png`,
    publicPath: `${PUBLIC_MEDIA_PATH}/workflow-diagram.png`,
    filename: "workflow-diagram.png",
    extension: "png",
    kind: "image",
    size: 72_500,
  },
];

export const DEMO_SIMULATED_UPLOAD_PUBLIC_PATH = `${PUBLIC_MEDIA_PATH}/upload-demo.png`;
