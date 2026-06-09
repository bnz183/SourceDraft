# Non-technical overview

SourceDraft is a writing tool for blogs whose posts live as files in GitHub — common with static site generators like Astro.

## The problem it solves

Each post is usually one file: a short metadata block at the top (title, date, category) and your article text below. That is reliable, but everyday writing can mean:

- fixing slug and date mistakes by hand
- guessing which file path will appear in the repo
- switching between an editor, GitHub, and your build tool

SourceDraft keeps the writing and publish steps in one interface.

## What you do in Studio

1. Sign in with the admin password (set once by whoever installed SourceDraft)
2. Write your post — title, description, category, tags, body
3. Upload cover and inline images to your repo (optional)
4. Preview the exact output file SourceDraft will commit (MDX or Markdown)
5. Publish to GitHub when validation passes

There are no traffic charts, billing screens, or account tiers.

## What SourceDraft does not do

- Host or serve your public website
- Replace Astro or your current site builder
- Host images on external CDNs (uploads go to your GitHub repo's media folder)
- Manage comments, email lists, or analytics

After publish, your normal site build and deploy process runs unchanged.

## How publishing reaches GitHub

SourceDraft does not log into GitHub in your browser. When you publish:

1. Your article is checked on the server
2. It is turned into an MDX file
3. A secure token (stored in `.env`, not shown to you in the page) commits the file to your site repository

You need a GitHub repo for your blog and a token with permission to add or update files there. Without that setup, you can still write and preview — publish will stay disabled.

## Two kinds of settings

**`sourcedraft.config.json`** — where posts go, which categories appear, which adapter is used. Safe to share with your team or commit to git.

**`.env`** — password, GitHub token, and which repository to write to. Private; never commit.

Your technical contact can run **`pnpm setup`** once — a guided wizard that creates both files with plain-language questions — or edit them manually. Writers typically only need the Studio address and password.

In Studio **Settings**, a read-only status panel shows whether adapter, publisher, and credentials look complete (without showing secrets).

## Who sets it up?

Someone comfortable with GitHub tokens and environment files installs SourceDraft and points it at your blog repository. Writers use Studio after that.

Steps: [getting-started.md](getting-started.md)

Astro folder layout reference: [examples/astro-blog](../examples/astro-blog/) (integration example, not a full website).
