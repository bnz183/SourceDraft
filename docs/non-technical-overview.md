# Non-technical overview

SourceDraft is a writing tool for blogs whose posts live as files in Git (Astro, Hugo, Next.js, …) or on platforms like WordPress and Ghost.

**SourceDraft is not a hosted website builder.** It runs on a computer or server you (or your technical contact) control. Your public site still builds and deploys the same way as before.

## The problem it solves

Each post is usually one file or one API record: metadata (title, date, category) plus your article text. That is reliable, but everyday writing can mean:

- fixing slug and date mistakes by hand
- guessing which file path will appear in the repo
- switching between an editor, GitHub, and your build tool

SourceDraft keeps writing, preview, and publish in one interface.

## What you do in Studio

1. **Sign in** with the Studio password (set once by whoever installed SourceDraft — not a cloud account)
2. **Write** your post — title, description, category, tags, body, optional SEO fields
3. **Add images and files** — upload in Post details, then insert them in the editor toolbar
4. **Preview** the exact output file or fields SourceDraft will send
5. **Publish** when validation passes and setup is complete

If publish is disabled, that usually means setup is incomplete — not that you did something wrong. You can still draft and preview.

**Try demo mode** on the sign-in screen to explore with sample posts. Nothing is published; no GitHub account is needed.

There are no traffic charts, billing screens, or account tiers.

## What SourceDraft does not do

- Host or serve your public website
- Replace Astro, Hugo, WordPress, or your current site builder
- Provide WordPress-style comments, plugins, or full media library for remote CMS targets
- Manage team accounts or OAuth login (one shared password today)
- Include built-in AI writing, Agent API, or MCP (future possibilities only)

After publish to a **git** target, your normal site build and deploy runs unchanged. After publish to **WordPress/Ghost**, content appears in that CMS — your static site is unaffected unless you wire something else.

## How publishing works (plain language)

SourceDraft does not log into GitHub in your browser. When you publish:

1. Your article is checked on the server
2. SourceDraft turns it into the right file format for your site
3. A secure connection (configured by your technical contact) sends the file to GitHub, GitLab, WordPress, Ghost, or similar

Without that setup, you can still write and preview — publish stays disabled or runs in **demo mode**.

## Settings for writers vs technical contacts

**Safe to share:** where posts go, which categories appear — usually in a config file your contact maintains.

**Private (never in the browser):** passwords and API keys live in a server `.env` file.

Your technical contact can run **`pnpm setup`** once or edit files manually. Writers typically only need the Studio address and password.

In Studio **Settings**:

- **Setup detection** — scans your project and suggests where articles and images should go
- **Setup health** — shows whether configuration looks complete (without showing secrets)

Advanced terms like *adapter*, *publisher*, and *frontmatter* appear in developer docs and Settings details — not on the main writing screen.

## Compared to other tools

| You might know… | SourceDraft is… |
|-----------------|-----------------|
| Decap CMS | A local Studio + publish API; config in SourceDraft repo, not `admin/config.yml` in the site |
| TinaCMS | File-first with adapters; no Tina Cloud required |
| WordPress admin | Optional publisher only — not a full WP replacement |
| GitHub web editor | Validated fields, preview, media upload, SEO panel |
| Medium / Google Docs | Similar writing toolbar feel, but output is your Git-owned Markdown/MDX |

See [editor-parity.md](editor-parity.md) for a feature comparison.

## Who sets it up?

Someone comfortable with API tokens and environment files installs SourceDraft and points it at your blog repository or CMS. Writers use Studio after that.

Steps: [getting-started.md](getting-started.md) · Recipes: [quickstart-recipes.md](quickstart-recipes.md)

Astro folder layout reference: [examples/astro-blog](../examples/astro-blog/) (integration example, not a full website).
