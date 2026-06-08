import type { DemoFixturePost } from "../types.js";
import { DEMO_CONTENT_DIR } from "./constants.js";

/**
 * Stable seed posts for demo mode. Reloaded from these fixtures on every API start
 * and when resetDemoStore() runs. Edits during a session are in-memory only.
 */
export const DEMO_POST_FIXTURES: DemoFixturePost[] = [
  {
    summary: {
      path: `${DEMO_CONTENT_DIR}/getting-started-with-sourcedraft.mdx`,
      title: "Getting started with SourceDraft",
      slug: "getting-started-with-sourcedraft",
      pubDate: "2026-06-06",
      category: "Guides",
      draft: false,
    },
    content: `---
title: Getting started with SourceDraft
description: A published guide showing the MDX shape Studio writes to your content folder.
pubDate: 2026-06-06
category: Guides
tags:
  - sourcedraft
  - guides
draft: false
---

# Getting started with SourceDraft

This published guide demonstrates how articles look after you validate metadata and body in Studio.

## What you can try in demo mode

- Edit title, description, and body locally
- Preview adapter output before a real publish
- Simulate publish without GitHub commits

## Next steps

Open other sample posts to see drafts, images, and internal links.
`,
  },
  {
    summary: {
      path: `${DEMO_CONTENT_DIR}/draft-release-notes.mdx`,
      title: "Draft release notes",
      slug: "draft-release-notes",
      pubDate: "2026-06-01",
      category: "Notes",
      draft: true,
    },
    content: `---
title: Draft release notes
description: A sample draft post for filters, badges, and unpublished workflow.
pubDate: 2026-06-01
category: Notes
tags:
  - draft
  - release
draft: true
---

# Draft release notes

This post is marked \`draft: true\` in frontmatter. It appears in the post list with a draft badge.

Use it to confirm draft filters and publishing gates behave as expected.
`,
  },
  {
    summary: {
      path: `${DEMO_CONTENT_DIR}/publishing-with-images.mdx`,
      title: "Publishing with images",
      slug: "publishing-with-images",
      pubDate: "2026-05-28",
      category: "Tutorials",
      draft: false,
    },
    content: `---
title: Publishing with images
description: Example post with inline image Markdown and a cover image path.
pubDate: 2026-05-28
category: Tutorials
tags:
  - images
  - markdown
heroImage: /images/sample-cover.png
draft: false
---

# Publishing with images

Studio uploads land in your configured media folder. Public paths are inserted into posts.

![Diagram of the write-preview-publish flow](/images/workflow-diagram.png)

## Cover images

Set a hero image in Post details or reference a path from the media library.

## Inline images

Use the toolbar or paste Markdown like the example above.
`,
  },
  {
    summary: {
      path: `${DEMO_CONTENT_DIR}/linking-and-outline.mdx`,
      title: "Linking and document outline",
      slug: "linking-and-outline",
      pubDate: "2026-05-20",
      category: "Tutorials",
      draft: false,
    },
    content: `---
title: Linking and document outline
description: Sample post with headings, internal links, and outline-friendly structure.
pubDate: 2026-05-20
category: Tutorials
tags:
  - links
  - outline
draft: false
---

# Linking and document outline

Use headings to structure long articles. The document outline panel lists H1–H3 sections.

## Internal links

Link to other demo posts with the Internal toolbar action or Markdown syntax:

- [Getting started with SourceDraft](/getting-started-with-sourcedraft)
- [Publishing with images](/publishing-with-images)

## External links

External URLs work as usual: [Markdown guide](https://www.markdownguide.org/).

### Subsections

Smaller headings help readers scan technical content without extra UI chrome.
`,
  },
];
