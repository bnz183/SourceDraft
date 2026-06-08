# SourceDraft

SourceDraft is a free, open-source editor for Markdown and MDX blogs backed by GitHub. You write in the browser, upload images, check your metadata, preview the generated file, and publish into your site repository.

**Project status:** SourceDraft is an early local/private MVP for Git-backed Markdown and MDX publishing. It is usable for solo writing and GitHub commits, but it is not a hosted CMS, multi-user product, or finished SaaS. See [docs/project-status.md](docs/project-status.md) and [CHANGELOG.md](CHANGELOG.md).

SourceDraft began as an internal tool for [QuBrite.com](https://qubrite.com) and is published here for anyone running a similar static-site workflow. QuBrite is the origin story, not a dependency — you point SourceDraft at your own repository and config.

## Screenshots

Screenshots are not included in the repository yet. Expected images and capture instructions: [docs/screenshots.md](docs/screenshots.md).

When added, they will live in `docs/assets/` (overview, editor preview, media upload, publish success).

## What is SourceDraft?

SourceDraft is not WordPress and not a hosted website builder. It is a local **Studio** (editor) plus a small **publish API** that commits content and media files to GitHub.

Your static site — Astro today, others later — still builds and deploys exactly as before. SourceDraft creates or updates `.mdx` or `.md` files in the folder you configure, and can upload images to `mediaDir`.

## Who is this for?

**Bloggers and writers** on Git-backed static sites who want one place to draft posts without hand-editing frontmatter and Git commands.

**Developers** who want a shared article schema, Markdown/MDX adapters, and room to add more publishing targets later.

**Not a fit yet** if you need hosted multi-user accounts, OAuth, or a built-in site generator in this repository.

## What it does today

- Edit articles in Studio (title, slug, dates, category, tags, body, draft flag)
- List and edit existing posts from your GitHub `contentDir`
- Validate fields against a universal article schema
- Preview Markdown or Astro MDX output and target file path before publishing
- Publish to GitHub (create or update a file on a branch)
- Upload images to GitHub (`mediaDir`) from Studio
- Configure paths, adapter, and categories in `sourcedraft.config.json`
- Protect Studio with a server-side admin password
- **Demo mode** — explore Studio with sample posts without GitHub credentials
- **Setup health** — Settings panel checks for missing config (no secrets exposed)

## What it does not do yet

- Host your website or run your Astro build
- OAuth, user accounts, or role-based access
- Cloud image hosts (Cloudinary, S3, R2, etc.)
- Adapters beyond `astro-mdx` and `markdown`

See [docs/project-status.md](docs/project-status.md).

## How GitHub publishing works

1. You finish a valid article in Studio and click **Publish to GitHub**.
2. The **publish API** (server only) validates the article again.
3. The configured **adapter** builds the file (YAML frontmatter + body) as `.mdx` or `.md`.
4. The **GitHub publisher** checks whether the file exists in your repo, then creates or updates it via the GitHub API.
5. Your existing CI or build step picks up the new file from `contentDir`.

The GitHub token never reaches the browser. It is read from `.env` on the server when you publish or upload media.

Details: [docs/github-publishing.md](docs/github-publishing.md) · [docs/media.md](docs/media.md)

v0.1 uses the GitHub Contents API — suitable for typical blogs; very large content folders are a known MVP limitation.

## Quickstart

Requirements: Node.js 22+, pnpm 11+

```bash
git clone https://github.com/bnz183/SourceDraft.git
cd SourceDraft
pnpm install

cp sourcedraft.config.example.json sourcedraft.config.json
cp .env.example .env
```

Edit `.env`:

```env
SOURCEDRAFT_ADMIN_PASSWORD=choose-a-local-password
GITHUB_TOKEN=your-github-token
GITHUB_OWNER=your-github-username-or-org
GITHUB_REPO=your-site-repo
```

Start Studio (UI + publish API):

```bash
pnpm dev
```

Sign in, click **New post**, preview the output, publish. The file lands at `contentDir/<slug>.mdx` or `.md` depending on your adapter (default: `src/content/blog/`).

**Try without GitHub:** set `SOURCEDRAFT_DEMO_MODE=true` in `.env`, or leave GitHub vars empty and click **Explore demo mode** on the sign-in screen.

Full walkthrough: [docs/getting-started.md](docs/getting-started.md)

## Beginner path

If someone technical already installed SourceDraft and pointed it at your blog repository, you only need:

1. The Studio address (usually `http://localhost:5173` on their machine)
2. The admin password they set in `.env`
3. Your site’s category list (from `sourcedraft.config.json`)

Then: sign in → open a post from the **Posts** sidebar, or click **New post** → fill in title, description, category, tags, and body → upload images if needed → check the preview → **Publish to GitHub**. Your post appears as a file in the blog repo; the normal site build deploys it.

You do not edit GitHub by hand or run terminal commands for each post. If publish is disabled, ask your technical contact to check `.env` (GitHub token and repo) and that Studio is running with `pnpm dev`.

Plain-language guide: [docs/non-technical-overview.md](docs/non-technical-overview.md)

## Security note

MVP password auth is intended for local/private use. Do not expose Studio publicly without HTTPS, stronger auth, and deployment hardening.

Details: [docs/security.md](docs/security.md)

## Configuration: two files, two jobs

| | `sourcedraft.config.json` | `.env` |
|---|---------------------------|--------|
| **Purpose** | Project settings safe to commit | Secrets and private targets |
| **Examples** | `contentDir`, `mediaDir`, `publicMediaPath`, `categories`, `adapter` | `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `SOURCEDRAFT_ADMIN_PASSWORD` |
| **Shared in git?** | Yes (copy from `sourcedraft.config.example.json`) | Never |

Optional env vars (`CMS_CONTENT_DIR`, `CMS_MEDIA_DIR`, `CMS_PUBLIC_MEDIA_PATH`, `CMS_ADAPTER`, etc.) can override values from the JSON file. Secrets always stay in `.env`.

`mediaDir` is where images are committed in your site repo. `publicMediaPath` is the URL path Studio inserts into posts (for example `/images`).

Reference: [docs/configuration.md](docs/configuration.md)

## Astro integration example

[examples/astro-blog/](examples/astro-blog/) is a **folder layout example** — not a runnable Astro site. It shows where files go, a sample published `.mdx`, and matching config. Read its README before copying paths into your own blog repo.

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, commands, and security reminders.

## Documentation

- [Getting started](docs/getting-started.md)
- [Non-technical overview](docs/non-technical-overview.md) — for writers
- [GitHub publishing](docs/github-publishing.md)
- [Media uploads](docs/media.md)
- [Configuration](docs/configuration.md)
- [Astro integration example](docs/astro-blog-example.md)
- [Architecture](docs/architecture.md)
- [Adapters](docs/adapters.md)
- [Project status](docs/project-status.md)
- [Manual acceptance test](docs/manual-acceptance-test.md)
- [Smoke tests (Playwright)](docs/getting-started.md#smoke-tests-playwright)
- [Release checklist](RELEASE_CHECKLIST.md)
- [Security](docs/security.md)
- [Screenshots guide](docs/screenshots.md)
- [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE)
