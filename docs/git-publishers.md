# Git publishing (GitHub, GitLab, Bitbucket)

SourceDraft publishes **files**, not live websites. When you click **Publish** in Studio, a server-side process commits content into the repository you configure.

Set the publisher in `sourcedraft.config.json` (`publisher`) or override with `CMS_PUBLISHER` in `.env`. Secrets always stay in `.env` — they never reach the browser.

| Publisher | Env prefix | API style |
|-----------|------------|-----------|
| `github` | `GITHUB_*` | [GitHub Contents API](github-publishing.md) |
| `gitlab` | `GITLAB_*` | GitLab Repository Files API |
| `bitbucket` | `BITBUCKET_*` | Bitbucket commit-upload (`POST …/src`) |

## GitLab

### Environment variables

| Variable | Required | Role |
|----------|----------|------|
| `GITLAB_TOKEN` | Yes | Personal access token with `api` scope and repository write access |
| `GITLAB_PROJECT_ID` or `GITLAB_PROJECT_PATH` | Yes | Numeric project id or `namespace/project` path |
| `GITLAB_BRANCH` | No | Target branch; defaults to `defaultBranch` in config |
| `GITLAB_BASE_URL` | No | Self-managed GitLab URL; defaults to `https://gitlab.com` |

### How it works

1. Studio sends article JSON to `POST /api/publish` (cookie session required).
2. The server validates the article and renders file content through the selected adapter.
3. The GitLab publisher checks whether the file exists with `GET /projects/:id/repository/files/:file_path`.
4. If missing → `POST` to create. If present → `PUT` to update.
5. Project id/path and file path are URL-encoded correctly (`group%2Fproject`, `src%2Fcontent%2Fblog%2Fpost.mdx`).

Optional commit author fields can be set in `publisherOptions` (`authorName`, `authorEmail`).

### Capabilities

- Publish posts (create/update)
- Upload media (base64 via Repository Files API)
- List and read existing posts under `contentDir` (repository tree + files API)

### Common failures

| Symptom | Likely cause |
|---------|----------------|
| `GITLAB_TOKEN` / 401 | Missing, expired, or revoked token |
| Project not found | Wrong `GITLAB_PROJECT_ID` or `GITLAB_PROJECT_PATH` |
| Branch not found | Wrong `GITLAB_BRANCH` |
| Identical content | Treated as a successful no-op (no empty commit error) |

## Bitbucket Cloud

### Environment variables

| Variable | Required | Role |
|----------|----------|------|
| `BITBUCKET_TOKEN` | Yes | API token or app password |
| `BITBUCKET_WORKSPACE` | Yes | Workspace slug |
| `BITBUCKET_REPO_SLUG` | Yes | Repository slug |
| `BITBUCKET_BRANCH` | No | Target branch; defaults to `defaultBranch` in config |
| `BITBUCKET_USERNAME` | Sometimes | Required with app passwords (Basic auth: `username:token`) |

### How it works

Bitbucket uses a **commit-upload** model, not a per-file Contents API like GitHub:

- All creates and updates go through `POST /2.0/repositories/{workspace}/{repo_slug}/src`
- Text files use `application/x-www-form-urlencoded` (`message`, `branch`, and `path/to/file` fields)
- Binary media uses `multipart/form-data`

There is no separate “update file” endpoint — each publish uploads the file path and content in a new commit.

### Capabilities

- Publish posts (create/update via commit upload)
- Upload media (multipart commit upload)

**Not supported yet:** listing or reading existing posts in Studio (`listPosts` / `readPost`). Use GitHub or GitLab if you need the Posts sidebar against a remote repo.

### Common failures

| Symptom | Likely cause |
|---------|----------------|
| 401 Unauthorized | Invalid token; set `BITBUCKET_USERNAME` when using an app password |
| Repository not found | Wrong `BITBUCKET_WORKSPACE` or `BITBUCKET_REPO_SLUG` |
| Branch not found | Wrong `BITBUCKET_BRANCH` |
| No changes to commit | Identical content — treated as a successful no-op |

## Shared behavior

- `publishArticle(article, options)` renders through the selected adapter, then publishes the output path and content.
- `uploadMedia` commits to `mediaDir` when the publisher supports it.
- All HTTP calls run server-side only; tokens are read from `.env` at request time.

See also: [configuration.md](configuration.md) · [media.md](media.md) · [github-publishing.md](github-publishing.md)
