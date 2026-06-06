# Configuration

See also: [Getting started](getting-started.md) · [GitHub publishing](github-publishing.md) · [Non-technical overview](non-technical-overview.md)

## Secrets vs project settings

SourceDraft uses two files on purpose:

**`sourcedraft.config.json`** — shareable project settings

- Content paths (`contentDir`, `mediaDir`)
- Adapter name (`astro-mdx`)
- Category list for Studio
- Default branch name when `GITHUB_BRANCH` is unset

Safe to commit. Copy from `sourcedraft.config.example.json` and adjust for your site.

**`.env`** — private values

- `SOURCEDRAFT_ADMIN_PASSWORD` — Studio login
- `GITHUB_TOKEN` — publish permission
- `GITHUB_OWNER`, `GITHUB_REPO` — which repository receives files
- Optional overrides: `GITHUB_BRANCH`, `CMS_CONTENT_DIR`, `CMS_MEDIA_DIR`, `CMS_ADAPTER`

Never commit `.env`. The browser never receives these values.

Think of it this way: **config describes your site layout; env proves who you are and which repo to write to.**

## Project config file

```bash
cp sourcedraft.config.example.json sourcedraft.config.json
```

Example:

```json
{
  "adapter": "astro-mdx",
  "contentDir": "src/content/blog",
  "mediaDir": "src/assets/images",
  "defaultBranch": "main",
  "categories": ["Guides", "Notes", "Reviews", "Tutorials", "Reference"]
}
```

| Field | Purpose |
|-------|---------|
| `adapter` | Publishing adapter (`astro-mdx` today) |
| `contentDir` | Directory for generated `.mdx` files |
| `mediaDir` | Expected path prefix for hero images |
| `defaultBranch` | Branch when `GITHUB_BRANCH` is unset |
| `categories` | Options in the Studio category dropdown |

SourceDraft searches for `sourcedraft.config.json` in the working directory, up to three levels up (monorepo-friendly), or at `SOURCEDRAFT_CONFIG`.

Missing file → built-in defaults matching the example above.

## Environment variables

```env
SOURCEDRAFT_ADMIN_PASSWORD=
GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=
GITHUB_BRANCH=main
```

Optional overrides:

```env
CMS_CONTENT_DIR=
CMS_MEDIA_DIR=
CMS_ADAPTER=
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `SOURCEDRAFT_ADMIN_PASSWORD` | Yes for Studio | Server-side login password |
| `GITHUB_TOKEN` | Yes to publish | GitHub API token (server only) |
| `GITHUB_OWNER` | Yes to publish | Repository owner |
| `GITHUB_REPO` | Yes to publish | Repository name |
| `GITHUB_BRANCH` | No | Overrides `defaultBranch` |
| `CMS_CONTENT_DIR` | No | Overrides `contentDir` |
| `CMS_MEDIA_DIR` | No | Overrides `mediaDir` |
| `CMS_ADAPTER` | No | Overrides `adapter` |

## Precedence

Non-secret settings:

```
.env override → sourcedraft.config.json → built-in defaults
```

Secrets:

```
.env only (never in sourcedraft.config.json)
```
