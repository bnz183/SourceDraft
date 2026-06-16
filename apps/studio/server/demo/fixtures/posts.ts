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
      title: "AI-assisted publishing with SourceDraft",
      slug: "getting-started-with-sourcedraft",
      pubDate: "2026-06-06",
      category: "AI-Assisted Publishing",
      draft: false,
    },
    content: `---
title: AI-assisted publishing with SourceDraft
description: How git-backed Studio workflows help teams draft, validate, and publish technical content with automation-friendly Markdown.
pubDate: 2026-06-06
category: AI-Assisted Publishing
tags:
  - sourcedraft
  - ai-assisted-publishing
  - git-backed-cms
draft: false
---

# AI-assisted publishing with SourceDraft

SourceDraft is built for writers and operators who want **assisted publishing**: validate metadata in Studio, preview adapter output, then commit portable Markdown/MDX to your own repository — ready for CI, deploy hooks, and static-site automation.

## What you can try in demo mode

- Edit title, description, and body with a rich editor or source view
- Preview Astro MDX output before a real publish
- Simulate publish without GitHub commits or tokens

## Automation-friendly by design

Posts stay plain files in \`contentDir\`, so your existing pipelines (GitHub Actions, Cloudflare Pages, Hugo/Astro builds) keep working. No proprietary lock-in.

## Next steps

Open the other sample posts to see drafts, media in automated pipelines, and internal links for content ops workflows.
`,
  },
  {
    summary: {
      path: `${DEMO_CONTENT_DIR}/draft-release-notes.mdx`,
      title: "Draft: workflow automation release notes",
      slug: "draft-release-notes",
      pubDate: "2026-06-01",
      category: "Workflow Automation",
      draft: true,
    },
    content: `---
title: Draft: workflow automation release notes
description: Sample draft for testing publish gates, deploy hooks, and editorial automation before content goes live.
pubDate: 2026-06-01
category: Workflow Automation
tags:
  - draft
  - automation
  - deploy-hooks
draft: true
---

# Draft: workflow automation release notes

This post is marked \`draft: true\`. Use it to confirm draft filters, publish checklists, and CI gates behave as expected before your build pipeline promotes content.

## Planned automation improvements

- Webhook-triggered rebuilds after Studio publish
- Category-aware RSS and sitemap generation
- Safer preview URLs for editorial review bots

Nothing here is published until you clear the draft flag and run a real publish.
`,
  },
  {
    summary: {
      path: `${DEMO_CONTENT_DIR}/publishing-with-images.mdx`,
      title: "Content pipelines with media uploads",
      slug: "publishing-with-images",
      pubDate: "2026-05-28",
      category: "Content Pipelines",
      draft: false,
    },
    content: `---
title: Content pipelines with media uploads
description: Example post showing hero images and inline assets in a git-backed media workflow for static sites.
pubDate: 2026-05-28
category: Content Pipelines
tags:
  - media
  - content-pipelines
  - static-deploy
heroImage: /images/sample-cover.png
draft: false
---

# Content pipelines with media uploads

Studio uploads images to your configured \`mediaDir\`. Public paths are inserted into posts so Astro, Hugo, or Next.js builds pick them up without a separate DAM.

![Diagram of write → preview → commit → build automation](/images/workflow-diagram.png)

## Hero images

Set a hero image in Article details or pick a path from the media library after upload.

## Inline assets in automated builds

Use the editor toolbar or Markdown syntax. Your site generator and CDN workflow treat these like any other static asset in the repo.
`,
  },
  {
    summary: {
      path: `${DEMO_CONTENT_DIR}/linking-and-outline.mdx`,
      title: "CMS integrations and internal linking",
      slug: "linking-and-outline",
      pubDate: "2026-05-20",
      category: "CMS Integrations",
      draft: false,
    },
    content: `---
title: CMS integrations and internal linking
description: Structure long-form technical articles with headings, internal links, and outline navigation for editorial automation.
pubDate: 2026-05-20
category: CMS Integrations
tags:
  - cms
  - internal-links
  - editorial-workflow
draft: false
---

# CMS integrations and internal linking

Use headings to structure articles that feed search, RSS, and AI summarization tools. The document outline lists H1–H3 sections for quick navigation.

## Internal links between posts

Link to other demo posts with the Internal toolbar action or Markdown:

- [AI-assisted publishing with SourceDraft](/getting-started-with-sourcedraft)
- [Content pipelines with media uploads](/publishing-with-images)

## External references

Automation stacks often combine git CMS with external docs: [Markdown guide](https://www.markdownguide.org/).

### Subsections for tooling docs

Smaller headings help readers scan integration guides without extra UI chrome — useful when content is syndicated to help centers or AI assistants.
`,
  },
];
