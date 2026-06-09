# GitHub publishing

SourceDraft publishes **files**, not live websites. When you click **Publish to GitHub** in Studio, a server-side process commits one content file into the repository you configure.

The file format depends on your adapter: `.mdx` for `astro-mdx`, `.md` for `markdown`. Both use YAML frontmatter plus the article body.

## What you need

In `.env` (never committed):

| Variable | Role |
|----------|------|
| `GITHUB_TOKEN` | Authenticates with GitHub (write access to repo contents) |
| `GITHUB_OWNER` | User or organization that owns the repo |
| `GITHUB_REPO` | Repository name for your **site**, not necessarily this SourceDraft repo |
| `GITHUB_BRANCH` | Optional; defaults to `defaultBranch` in `sourcedraft.config.json` |

In `sourcedraft.config.json`:

| Field | Role |
|-------|------|
| `contentDir` | Folder inside the repo where post files are written |
| `adapter` | Output format (`astro-mdx` or `markdown`) |

The same token is used for media uploads to `mediaDir`. See [media.md](media.md).

## Step by step

1. **Studio** sends article JSON to `POST /api/publish` (cookie session required). When editing an existing post, it includes `sourcePath` so the same repo file is updated.
2. **Server** loads token and repo from `.env`, paths from config.
3. **Core** validates the article.
4. **Adapter** produces file text and the relative path (for example `src/content/blog/my-post.mdx` or `src/content/blog/my-post.md`).
5. **Publisher** calls the GitHub Contents API:
   - if the file exists → update with the file’s current `sha`
   - if not → create
6. GitHub stores the commit on your branch.

Your Astro (or other) build runs separately — on push, in CI, or locally.

## Listing and editing

`GET /api/posts` lists `.md` and `.mdx` files under `contentDir`. `GET /api/posts?path=...` loads one post for editing. Paths are validated server-side so requests cannot escape `contentDir`.

## What never touches the browser

- `GITHUB_TOKEN`
- `SOURCEDRAFT_ADMIN_PASSWORD`

Studio only holds a session cookie after login.

## Common failures

| Message / symptom | Check |
|-------------------|--------|
| Authentication required | Sign in to Studio |
| `GITHUB_TOKEN is not configured` | `.env` on server, restart API |
| 401 / 403 from GitHub | Token scope or repo access |
| Wrong path | `contentDir` in config vs your site layout |
| Unsupported adapter | `adapter` must be `astro-mdx` or `markdown` |

## Token scope

Use a personal access token that can read and write repository contents for the target repo. Fine-grained tokens should be limited to that repository.

For a plain-language summary, see [non-technical-overview.md](non-technical-overview.md).
