# Configuration

SourceDraft splits configuration into two layers:

1. **Project config** — `sourcedraft.config.json` (non-secret, commit-safe)
2. **Environment variables** — `.env` (secrets and optional overrides)

## Project config

Copy the example file at the repository root:

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
| `contentDir` | Target directory for generated content files |
| `mediaDir` | Expected media path for hero images and assets |
| `defaultBranch` | Default Git branch when `GITHUB_BRANCH` is unset |
| `categories` | Category options shown in Studio |

SourceDraft looks for `sourcedraft.config.json` in:

- The current working directory
- Two and three levels above (monorepo-friendly)
- A custom path via `SOURCEDRAFT_CONFIG`

If no file is found, built-in defaults are used.

## Environment variables

Keep secrets and deployment-specific values in `.env`:

```env
GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=
GITHUB_BRANCH=main
```

Optional overrides:

```env
CMS_CONTENT_DIR=src/content/blog
CMS_MEDIA_DIR=src/assets/images
CMS_ADAPTER=astro-mdx
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `SOURCEDRAFT_ADMIN_PASSWORD` | Yes (Studio) | Local MVP password for Studio access |
| `GITHUB_TOKEN` | Yes | GitHub API token (server-side only) |
| `GITHUB_OWNER` | Yes | Repository owner |
| `GITHUB_REPO` | Yes | Repository name |
| `GITHUB_BRANCH` | No | Overrides `defaultBranch` from project config |
| `CMS_CONTENT_DIR` | No | Overrides `contentDir` from project config |
| `CMS_MEDIA_DIR` | No | Overrides `mediaDir` from project config |
| `CMS_ADAPTER` | No | Overrides `adapter` from project config |

Never commit `.env`. Never expose `GITHUB_TOKEN` to browser code.

## Precedence

For non-secret publishing settings:

```
environment override → sourcedraft.config.json → built-in defaults
```

Secrets always come from environment variables.
