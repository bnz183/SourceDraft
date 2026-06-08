# Configuration

See also: [Getting started](getting-started.md) · [GitHub publishing](github-publishing.md) · [Media uploads](media.md)

## Secrets vs project settings

SourceDraft uses two files on purpose:

**`sourcedraft.config.json`** — shareable project settings

- Content paths (`contentDir`, `mediaDir`, `publicMediaPath`)
- Adapter name — see [adapters.md](adapters.md) compatibility matrix
- Publisher name (`github`, `gitlab`, or `bitbucket`)
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
  "publisher": "github",
  "categories": ["Guides", "Notes", "Reviews", "Tutorials", "Reference"]
}
```

| Field | Purpose |
|-------|---------|
| `adapter` | Output format — see [adapters.md](adapters.md) |
| `publisher` | Publishing target — see [Publishers](#publishers) below |
| `adapterOptions` | Optional adapter-specific settings (layout, Hugo TOML, Jekyll filenames, etc.) |
| `publisherOptions` | Optional publisher-specific settings (reserved for future targets) |
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
| `nextjs-mdx` | `@sourcedraft/adapter-nextjs-mdx` | `contentDir/<slug>.mdx` |
| `hugo-markdown` | `@sourcedraft/adapter-hugo-markdown` | `contentDir/<slug>.md` |
| `eleventy-jekyll-markdown` | `@sourcedraft/adapter-eleventy-jekyll-markdown` | `contentDir/<slug>.md` or `contentDir/YYYY-MM-DD-<slug>.md` |
| `docusaurus-mdx` | `@sourcedraft/adapter-docusaurus-mdx` | `contentDir/<slug>.mdx` (filename conventions via `adapterOptions`) |
| `mkdocs-markdown` | `@sourcedraft/adapter-mkdocs-markdown` | `contentDir/<slug>.md` |
| `nuxt-content-markdown` | `@sourcedraft/adapter-nuxt-content-markdown` | `contentDir/<slug>.md` |

Full compatibility matrix and options: [adapters.md](adapters.md).

Set in `sourcedraft.config.json`, or override with `CMS_ADAPTER` in `.env`.

### Publishers

| Value | Package | Capabilities |
|-------|---------|--------------|
| `github` | `@sourcedraft/publishers` → `@sourcedraft/github-publisher` | Publish posts, upload media, list/read files via GitHub Contents API |
| `gitlab` | `@sourcedraft/publishers` | Publish posts, upload media, list/read files via GitLab Repository Files API |
| `bitbucket` | `@sourcedraft/publishers` | Publish posts and upload media via Bitbucket commit-upload API (no list/read yet) |

Set in `sourcedraft.config.json`, or override with `CMS_PUBLISHER` in `.env`. Default: `github`.

Studio resolves publishers through `publisherRegistry`. Unknown publisher ids return a clear configuration error before any API call.

Publisher-specific env vars and API behavior: [git-publishers.md](git-publishers.md).

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

Wrong `contentDir` or `mediaDir` values produce clear publisher errors in Studio when listing posts, opening a post, publishing, or uploading media. See [git-publishers.md](git-publishers.md) and [github-publishing.md](github-publishing.md#common-failures).

## Environment variables

Copy from `.env.example`. Set credentials for the publisher selected in `sourcedraft.config.json` (`publisher` or `CMS_PUBLISHER`).

**GitHub** (default): `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, optional `GITHUB_BRANCH`

**GitLab:** `GITLAB_TOKEN`, `GITLAB_PROJECT_ID` or `GITLAB_PROJECT_PATH`, optional `GITLAB_BRANCH`, `GITLAB_BASE_URL`

**Bitbucket:** `BITBUCKET_TOKEN`, `BITBUCKET_WORKSPACE`, `BITBUCKET_REPO_SLUG`, optional `BITBUCKET_BRANCH`, `BITBUCKET_USERNAME`

Shared optional overrides:

```env
CMS_CONTENT_DIR=
CMS_MEDIA_DIR=
CMS_PUBLIC_MEDIA_PATH=
CMS_ADAPTER=
CMS_PUBLISHER=
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `SOURCEDRAFT_ADMIN_PASSWORD` | Yes for Studio | Server-side login password |
| `GITHUB_*` | When `publisher` is `github` | GitHub API credentials (server only) |
| `GITLAB_*` | When `publisher` is `gitlab` | GitLab API credentials (server only) |
| `BITBUCKET_*` | When `publisher` is `bitbucket` | Bitbucket API credentials (server only) |
| `CMS_CONTENT_DIR` | No | Overrides `contentDir` |
| `CMS_MEDIA_DIR` | No | Overrides `mediaDir` |
| `CMS_PUBLIC_MEDIA_PATH` | No | Overrides `publicMediaPath` |
| `CMS_ADAPTER` | No | Overrides `adapter` |
| `CMS_PUBLISHER` | No | Overrides `publisher` (default `github`) |

Full publisher reference: [git-publishers.md](git-publishers.md).

## Precedence

Non-secret settings:

```
.env override → sourcedraft.config.json → built-in defaults
```

Secrets:

```
.env only (never in sourcedraft.config.json)
```

For local development and contributions, see [CONTRIBUTING.md](../CONTRIBUTING.md). Release history: [CHANGELOG.md](../CHANGELOG.md).
