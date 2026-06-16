# Non-technical overview

SourceDraft is a writing dashboard for people who want to run serious blogs and publications while keeping ownership of their content. It works with blogs whose posts live as files in Git (Astro, Hugo, Next.js, …) or on platforms like WordPress and Ghost.

## What SourceDraft is

A local **Studio** where you write articles in a clean editor, upload images, preview the generated file, and send finished posts to your blog. It is not a hosted website builder, not WordPress replacement software, and not a multi-user SaaS product today.

Think of it as: **your writing desk** connected to **your blog**, with a technical helper handling the wiring once.

**SourceDraft is not a hosted website builder.** It runs on a computer or server you (or your technical contact) control. Your public site still builds and deploys the same way as before.

## The problem it solves

Each post is usually one file or one API record: metadata (title, date, category) plus your article text. That is reliable, but everyday writing can mean:

- fixing slug and date mistakes by hand
- guessing which file path will appear in the repository
- switching between an editor, GitHub, and your build tool

SourceDraft keeps writing, preview, and publishing in one interface.

## What you see in Studio

1. **Articles** — your post list on the left
2. **Editor** — title, description, category, tags, body, and optional SEO fields
3. **Preview** — see the generated article file before you send it to your blog
4. **Send to your blog** — send the article when required fields are complete
5. **Settings** — publishing readiness checks and help for your technical contact

If sending is disabled, that usually means setup is incomplete — not that you did something wrong. You can still draft and preview.

**Try demo mode** on the sign-in screen to explore with sample posts. Nothing is published; no GitHub account is needed.

There are no traffic charts, billing screens, or account tiers.

### First visit — pick your path

The sign-in screen shows five choices:

1. **Try demo mode** — explore with sample posts; nothing is published; no GitHub or API tokens needed
2. **Write in an already-configured Studio** — use the Studio link and password from whoever set this up
3. **Connect an existing blog** — SourceDraft can inspect your project and suggest where articles and images should go (Settings → Advanced configuration after sign-in)
4. **Advanced developer setup** — config files, adapters, publishers, and environment variables (not one-click)
5. **Agent-ready workflow** — structured drafts, validation, preview, and human review for future AI/automation tools (built-in AI and Agent API are not shipped yet)

### Demo mode

Choose **Try demo mode** on the sign-in screen to explore SourceDraft without connecting a real blog.

- No real posts are published
- Sample content resets when the server restarts
- Safe to click around and try publishing

## What a technical helper configures

Someone comfortable with API tokens and environment files installs SourceDraft once and points it at your blog repository or CMS.

| What they set up | Where it lives | What writers need to know |
|------------------|----------------|-------------------------|
| Studio password | Server `.env` file | You sign in with this password |
| Blog connection | Server `.env` file | Lets SourceDraft send articles to GitHub, GitLab, WordPress, Ghost, etc. |
| Article folder, categories, blog type | `sourcedraft.config.json` | Defines where articles are saved and which fields appear |

Writers typically only need the Studio address and password after setup.

In Studio **Settings**, **Publishing readiness** shows whether configuration looks complete — without showing secrets. Advanced details (adapter, publisher, paths) are under **Advanced configuration**.

## What happens when you click send

SourceDraft does not log into GitHub in your browser. When you send an article:

1. Your article is checked on the server
2. SourceDraft turns it into the right file format for your blog type (Markdown/MDX for static sites, or structured fields for CMS APIs)
3. A secure credential on the server (never shown in the page) saves the file or calls the remote API
4. For Git-backed blogs, your normal site build and deploy picks up the new article

Without a connected blog, you can still write and preview — sending stays disabled or runs in **demo mode**.

## What to do if publishing is disabled

Publishing disabled is usually a setup issue, not something you did wrong. You can still write and preview articles.

1. Open **Settings** and read **Publishing readiness**
2. Look for items marked **Needs attention**
3. Ask your technical helper to finish setup (they may need to configure GitHub credentials on the server), or try **demo mode** to keep exploring safely

Common messages in plain language:

- **GitHub connection** — publishing to GitHub is not connected yet
- **Article folder** — SourceDraft does not know where articles should be saved yet
- **Blog type** — choose the blog type SourceDraft should write for (Astro, Hugo, Next.js, …)

## What SourceDraft does not do

- Host or serve your public website
- Replace Astro, Hugo, or your current site builder
- Provide WordPress-style comments, plugins, or a full media library for remote CMS targets
- Manage team accounts or OAuth login (one shared password today)
- Offer one-click deploy or built-in AI writing

After publish to a **git** target, your normal site build and deploy runs unchanged. After publish to **WordPress/Ghost**, content appears in that CMS — your static site is unaffected unless you wire something else.

## Glossary

| Term | Plain meaning |
|------|----------------|
| **Git repository** | Where your site files live — often on GitHub, GitLab, or Bitbucket |
| **Markdown / MDX** | The article file format many static blogs use (plain text with simple formatting) |
| **Adapter** | Translator that shapes your article for your blog type (Astro, Hugo, Next.js, …) |
| **Publisher** | Where SourceDraft sends the finished post (your Git repo, WordPress, Ghost, …) |
| **Frontmatter** | The metadata block at the top of an article file (title, date, tags) — SourceDraft fills this for you |
| **Publishing readiness** | Studio checks that show whether sending articles to your blog should work |
| **Human-in-the-loop** | A person reviews the draft, checks preview, and decides when to publish |

## Compared to other tools

| You might know… | SourceDraft is… |
|-----------------|-----------------|
| Decap CMS | A local Studio + publish API; config in the SourceDraft repo, not `admin/config.yml` in the site |
| TinaCMS | File-first with adapters; no Tina Cloud required |
| WordPress admin | Optional publisher only — not a full WP replacement |
| GitHub web editor | Validated fields, preview, media upload, SEO panel |
| Medium / Google Docs | Similar writing toolbar feel, but output is your Git-owned Markdown/MDX |

See [editor-parity.md](editor-parity.md) for a feature comparison.

## Who sets it up?

Someone comfortable with API tokens and environment files installs SourceDraft and points it at your blog repository or CMS. Writers use Studio after that.

Steps: [getting-started.md](getting-started.md) · Recipes: [quickstart-recipes.md](quickstart-recipes.md)

Astro folder layout reference: [examples/astro-blog](../examples/astro-blog/) (integration example, not a full website).
