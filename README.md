# SourceDraft

SourceDraft is a free, open-source writing dashboard for Markdown and MDX blogs. It helps you draft posts, check metadata, preview MDX output, and publish files to a GitHub repository that powers a static site.

SourceDraft started as an internal publishing tool for [QuBrite.com](https://qubrite.com) and is being released as a free open-source project for other static-site publishers.

## What is SourceDraft?

SourceDraft is not a hosted CMS and not WordPress. It is a small local Studio plus a publishing pipeline:

1. Write an article in the browser
2. Validate title, slug, dates, category, and body
3. Preview the MDX file SourceDraft will create
4. Publish the file to your GitHub repo with one action

Your site still builds the way it already does (Astro, or another static generator). SourceDraft only writes content into the repo.

## Who is this for?

**Writers and bloggers** who use a Git-backed static site and want a focused editor instead of jumping between frontmatter, file paths, and Git commands.

**Developers** who maintain Markdown/MDX publications and want a portable schema, adapters, and a path to more publishing targets later.

**Not a fit (yet)** if you need multi-user accounts, media uploads inside the CMS, in-browser Git history, or a fully hosted backend.

## Quickstart

Requirements: Node.js 22+, pnpm 11+

```bash
git clone <your-fork-url>
cd sourcedraft
pnpm install

cp sourcedraft.config.example.json sourcedraft.config.json
cp .env.example .env
```

Edit `.env` with at least:

```env
SOURCEDRAFT_ADMIN_PASSWORD=choose-a-local-password
GITHUB_TOKEN=your-github-token
GITHUB_OWNER=your-github-username-or-org
GITHUB_REPO=your-site-repo
```

Start Studio:

```bash
pnpm dev
```

Open the local Studio URL, sign in, go to **New Article**, fill in the form, preview the MDX output, and publish.

Publishing writes a `.mdx` file into the path defined by `contentDir` in your config (default: `src/content/blog`).

## Configuration

SourceDraft uses two layers:

| Layer | File | Holds |
|-------|------|-------|
| Project config | `sourcedraft.config.json` | Adapter, content paths, categories |
| Secrets | `.env` | Password, GitHub token, repo target |

Example project config:

```json
{
  "adapter": "astro-mdx",
  "contentDir": "src/content/blog",
  "mediaDir": "src/assets/images",
  "defaultBranch": "main",
  "categories": ["Guides", "Notes", "Reviews", "Tutorials", "Reference"]
}
```

See [docs/configuration.md](docs/configuration.md) for precedence and overrides.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `SOURCEDRAFT_ADMIN_PASSWORD` | Yes | Protects Studio (server-side check) |
| `GITHUB_TOKEN` | Yes | Publishes files via GitHub API (server-side only) |
| `GITHUB_OWNER` | Yes | Repository owner |
| `GITHUB_REPO` | Yes | Repository name |
| `GITHUB_BRANCH` | No | Target branch (default: `main`) |
| `CMS_CONTENT_DIR` | No | Overrides `contentDir` from config |
| `CMS_MEDIA_DIR` | No | Overrides `mediaDir` from config |
| `CMS_ADAPTER` | No | Overrides `adapter` from config |

Never commit `.env`. The browser never receives your GitHub token or admin password.

## Current status

SourceDraft is an early MVP. It works for single-editor local publishing to GitHub, with the Astro MDX adapter.

Known limitations:

- Local password auth only (no OAuth or user accounts)
- No image upload inside Studio
- No article list synced from GitHub yet
- One adapter shipped: `astro-mdx`
- Sessions reset when the API server restarts

See [docs/project-status.md](docs/project-status.md) for detail.

## Examples

- [examples/astro-blog](examples/astro-blog/) — **integration example only** (folder layout + sample MDX + config; not a runnable Astro site)

## Documentation

- [Getting started](docs/getting-started.md) — setup walkthrough
- [Non-technical overview](docs/non-technical-overview.md) — for bloggers
- [Astro integration example](docs/astro-blog-example.md) — folder layout for an Astro MDX blog (not a starter site)
- [Configuration](docs/configuration.md) — config file and env reference
- [Architecture](docs/architecture.md) — how the pieces connect
- [Project status](docs/project-status.md) — MVP scope and roadmap context

## License

MIT
