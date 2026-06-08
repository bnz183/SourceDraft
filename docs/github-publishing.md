# GitHub publishing

SourceDraft publishes **files**, not live websites. When you click **Publish to GitHub** in Studio, a server-side process commits one content file into the repository you configure.

The file format depends on your adapter: `.mdx` for `astro-mdx`, `.md` for `markdown`. Both use YAML frontmatter plus the article body.

## What you need

In `.env` (never committed):

| Variable | Role |
|----------|------|
| `GITHUB_TOKEN` | Authenticates with GitHub (read/write access to repo contents) |
| `GITHUB_OWNER` | User or organization that owns the repo |
| `GITHUB_REPO` | Repository name for your **site**, not necessarily this SourceDraft repo |
| `GITHUB_BRANCH` | Optional; defaults to `defaultBranch` in `sourcedraft.config.json` |

In `sourcedraft.config.json`:

| Field | Role |
|-------|------|
| `contentDir` | Folder inside the repo where post files are written |
| `mediaDir` | Folder where image uploads are committed |
| `adapter` | Output format (`astro-mdx` or `markdown`) |

The same token is used for media uploads to `mediaDir`. See [media.md](media.md).

## GitHub Contents API (v0.1)

SourceDraft v0.1 uses the [GitHub Contents API](https://docs.github.com/en/rest/repos/contents) for:

- creating and updating post files
- listing and reading existing posts under `contentDir`
- uploading media files under `mediaDir`

This is intentional MVP scope: simple Git-backed publishing without a database or content indexer.

**Works well for:** typical blogs and small/medium content folders.

**Known limits:**

| Limit | Effect |
|-------|--------|
| ~1 MB per file (inline content) | Very large post or media files cannot be read or published inline |
| 1000 entries per directory listing | A single folder with more than 1000 items cannot be fully listed |
| No intermediate folder creation | Parent folders for `mediaDir` must already exist in the repo |
| Recursive listing | Deep trees require multiple API calls; large sites are slower |

**Future improvement:** Git Trees API or indexed content listing for very large repositories. v0.1 prioritizes straightforward Git publishing over large-scale indexing.

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

Existing post listing and editing works for normal GitHub content folders. If `contentDir` is wrong or missing, Studio shows a clear error pointing at config and the repo.

## What never touches the browser

- `GITHUB_TOKEN`
- `SOURCEDRAFT_ADMIN_PASSWORD`

Studio only holds a session cookie after login.

## Common failures

| Symptom | Likely cause |
|---------|----------------|
| Authentication required | Sign in to Studio |
| `GITHUB_TOKEN is not configured` | `.env` on server, restart API |
| GitHub rejected the token (401) | Missing, expired, or invalid `GITHUB_TOKEN` |
| GitHub denied access (403) | Token lacks read/write contents permission on the repo/branch |
| Could not find the posts folder | Wrong `contentDir` or folder missing on the branch |
| Could not find the media folder | Wrong `mediaDir` or parent folders not created yet |
| Repository not found | Wrong `GITHUB_OWNER` or `GITHUB_REPO` |
| Post not found / could not open | File moved, renamed, or deleted on GitHub |
| Directory listing limit reached | More than 1000 items in one folder — MVP Contents API limit |
| File too large for Contents API | Post or image over ~1 MB inline limit |
| Unsupported adapter | `adapter` must be `astro-mdx` or `markdown` |

Studio surfaces these messages from the server where possible. Check `.env`, `sourcedraft.config.json`, and the target repo on GitHub.

## Token scope

Use a personal access token that can read and write repository contents for the target repo. Fine-grained tokens should be limited to that repository.

For a plain-language summary, see [non-technical-overview.md](non-technical-overview.md).
