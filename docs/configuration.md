# Configuration

See also: [Getting started](getting-started.md) · [GitHub publishing](github-publishing.md) · [Media uploads](media.md)

## Secrets vs project settings

SourceDraft uses two files on purpose:

**`sourcedraft.config.json`** — shareable project settings

- Content paths (`contentDir`, `mediaDir`, `publicMediaPath`)
- Adapter name (`astro-mdx` or `markdown`)
- Category list for Studio
- Default branch name when `GITHUB_BRANCH` is unset

Safe to commit. Copy from `sourcedraft.config.example.json` and adjust for your site.

**`.env`** — private values

- `SOURCEDRAFT_ADMIN_PASSWORD` — Studio login
- `GITHUB_TOKEN` — publish and media upload permission
- `GITHUB_OWNER`, `GITHUB_REPO` — which repository receives files
- Optional overrides: `GITHUB_BRANCH`, `CMS_CONTENT_DIR`, `CMS_MEDIA_DIR`, `CMS_PUBLIC_MEDIA_PATH`, `CMS_ADAPTER`

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
  "mediaDir": "public/images",
  "publicMediaPath": "/images",
  "defaultBranch": "main",
  "categories": ["Guides", "Notes", "Reviews", "Tutorials", "Reference"]
}
```

| Field | Purpose |
|-------|---------|
| `adapter` | Output format: `astro-mdx` (`.mdx`) or `markdown` (`.md`) |
| `contentDir` | Directory for generated post files |
| `mediaDir` | Repository path where Studio commits uploaded images |
| `publicMediaPath` | Site-relative URL path inserted into `heroImage` and body Markdown |
| `defaultBranch` | Branch when `GITHUB_BRANCH` is unset |
| `categories` | Options in the Studio category dropdown |

### Adapter

| Value | Package | Output |
|-------|---------|--------|
| `astro-mdx` | `@sourcedraft/adapter-astro-mdx` | `contentDir/<slug>.mdx` |
| `markdown` | `@sourcedraft/adapter-markdown` | `contentDir/<slug>.md` |

Set in `sourcedraft.config.json`, or override with `CMS_ADAPTER` in `.env`.

### `mediaDir` and `publicMediaPath`

**`mediaDir`** is the folder inside your **site repository** where image uploads are committed (for example `public/images` or `src/assets/images`).

**`publicMediaPath`** is the site-relative URL path Studio inserts into frontmatter and Markdown (for example `/images`). It does not have to mirror the repo folder structure.

If `publicMediaPath` is omitted, SourceDraft derives it from `mediaDir`:

- When `mediaDir` starts with `public/`, strip that prefix (for example `public/images` → `/images`).
- Otherwise use the last segment (for example `src/assets/images` → `/images`).

Override locally with `CMS_PUBLIC_MEDIA_PATH` in `.env`. The upload API always uses server config — the browser cannot send arbitrary paths.

See [media.md](media.md) for upload flow and path behavior.

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
CMS_PUBLIC_MEDIA_PATH=
CMS_ADAPTER=
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `SOURCEDRAFT_ADMIN_PASSWORD` | Yes for Studio | Server-side login password |
| `GITHUB_TOKEN` | Yes to publish/upload | GitHub API token (server only) |
| `GITHUB_OWNER` | Yes to publish/upload | Repository owner |
| `GITHUB_REPO` | Yes to publish/upload | Repository name |
| `GITHUB_BRANCH` | No | Overrides `defaultBranch` |
| `CMS_CONTENT_DIR` | No | Overrides `contentDir` |
| `CMS_MEDIA_DIR` | No | Overrides `mediaDir` |
| `CMS_PUBLIC_MEDIA_PATH` | No | Overrides `publicMediaPath` |
| `CMS_ADAPTER` | No | Overrides `adapter` (`astro-mdx` or `markdown`) |

## Precedence

Non-secret settings:

```
.env override → sourcedraft.config.json → built-in defaults
```

Secrets:

```
.env only (never in sourcedraft.config.json)
```
