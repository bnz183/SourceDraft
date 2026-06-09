# Security

## Secrets stay on the server

- `GITHUB_TOKEN` — used only in the publish API when committing posts, listing/reading files, and uploading media
- `SOURCEDRAFT_ADMIN_PASSWORD` — checked only on the server at login

Studio stores a session cookie after login. It does not store the GitHub token or admin password in the browser.

## Server-only GitHub access

All GitHub API calls run in `apps/studio/server`:

| Endpoint | Token use |
|----------|-----------|
| `POST /api/publish` | Create or update post files |
| `GET /api/posts` | List and load posts from `contentDir` |
| `POST /api/media/upload` | Commit image files to `mediaDir` |

The client sends article JSON, post path queries, or multipart uploads. The server attaches credentials from `.env`.

Do not import `@sourcedraft/github-publisher` in browser code.

## Media uploads

Uploads are validated for allowed image types, maximum size (5 MB), and file signature before commit. Filenames are sanitized. See [media.md](media.md).

## Files

- Commit `sourcedraft.config.json` (no secrets)
- Never commit `.env` or `.env.local`
- Do not paste tokens into public issues

## Studio auth (MVP)

Single shared password, in-memory sessions.

**MVP password auth is intended for local/private use. Do not expose Studio publicly without HTTPS, stronger auth, and deployment hardening.**

This is not a multi-tenant production auth system yet.

Report security concerns privately; do not include live tokens in reports.
