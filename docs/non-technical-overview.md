# Non-technical overview

SourceDraft is a writing tool for blogs whose posts live as files in Git (Astro, Hugo, Next.js, …) or on platforms like WordPress and Ghost.

## The problem it solves

Each post is usually one file or one API record: metadata (title, date, category) plus your article text. That is reliable, but everyday writing can mean:

- fixing slug and date mistakes by hand
- guessing which file path will appear in the repo
- switching between an editor, GitHub, and your build tool

SourceDraft keeps writing, preview, and publish in one interface.

## What you do in Studio

1. Sign in with the admin password (set once by whoever installed SourceDraft)
2. Write your post — title, description, category, tags, body, optional SEO fields
3. Upload cover and inline images (to your git repo or Cloudinary, depending on setup)
4. Preview the exact output file or fields SourceDraft will send
5. Publish when validation passes

There are no traffic charts, billing screens, or account tiers.

## What SourceDraft does not do

- Host or serve your public website
- Replace Astro, Hugo, or your current site builder
- Provide WordPress-style comments, plugins, or full media library for remote CMS targets
- Manage team accounts or OAuth login (one shared password today)

After publish to a **git** target, your normal site build and deploy runs unchanged. After publish to **WordPress/Ghost**, content appears in that CMS — your static site is unaffected unless you wire something else.

## How publishing works

SourceDraft does not log into GitHub in your browser. When you publish:

1. Your article is checked on the server
2. The adapter turns it into Markdown/MDX (for preview and git publishers) or structured fields (for CMS APIs)
3. A secure token in `.env` (never shown in the page) commits the file or calls the remote API

Without publisher credentials, you can still write and preview — publish stays disabled or runs in **demo mode**.

## Two kinds of settings

**`sourcedraft.config.json`** — where posts go, which categories appear, which adapter and publisher. Safe to share or commit.

**`.env`** — password, API tokens, repository targets, optional Cloudinary or deploy hook. Private; never commit.

Your technical contact can run **`pnpm setup`** once or edit files manually. Writers typically only need the Studio address and password.

In Studio **Settings**, **Setup health** and **Compatibility & status** show whether configuration looks complete (without showing secrets).

## Compared to other tools

| You might know… | SourceDraft is… |
|-----------------|-----------------|
| Decap CMS | A local Studio + publish API; config in SourceDraft repo, not `admin/config.yml` in the site |
| TinaCMS | File-first with adapters; no Tina Cloud required |
| WordPress admin | Optional publisher only — not a full WP replacement |
| GitHub web editor | Validated fields, preview, media upload, SEO panel |

## Who sets it up?

Someone comfortable with API tokens and environment files installs SourceDraft and points it at your blog repository or CMS. Writers use Studio after that.

Steps: [getting-started.md](getting-started.md) · Recipes: [quickstart-recipes.md](quickstart-recipes.md)

Astro folder layout reference: [examples/astro-blog](../examples/astro-blog/) (integration example, not a full website).
