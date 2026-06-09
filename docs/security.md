# Security

## Secrets stay on the server

- `GITHUB_TOKEN` — used only in the publish API when committing posts, listing/reading files, and uploading media
- `SOURCEDRAFT_ADMIN_PASSWORD` — checked only on the server at login

Studio stores a session cookie after login. It does not store the GitHub token or admin password in the browser.

## Demo mode

When `SOURCEDRAFT_DEMO_MODE=true` or GitHub is not fully configured:

- Studio serves sample posts from server memory — not your repository.
- `POST /api/publish` and `POST /api/media/upload` simulate success and **never call the GitHub API**.
- Forced demo mode (`SOURCEDRAFT_DEMO_MODE=true`) blocks GitHub writes even if `GITHUB_TOKEN` is set.
- Demo sessions use the same HttpOnly cookie as password login; no secrets are stored in the browser.

Use demo mode for local exploration and smoke tests only. **MVP password auth is still intended for local/private use.**

## Session cookies (MVP)

After login, the server sets an in-memory session cookie:

| Attribute | Behavior |
|-----------|----------|
| `HttpOnly` | JavaScript cannot read the cookie — reduces token theft via XSS |
| `SameSite=Lax` | Browser limits cross-site cookie use on unsafe requests |
| `Secure` | Set only when running under HTTPS (`NODE_ENV=production`, `X-Forwarded-Proto: https`, or `STUDIO_SECURE_COOKIES=true`) |
| `Max-Age` | 24 hours |

This is MVP session handling, not durable account auth. Sessions are stored in server memory and reset when the process restarts.

## Request protection for state-changing routes

These routes use lightweight same-site checks before handling the request:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/publish`
- `POST /api/media/upload`

The middleware:

1. Uses `Sec-Fetch-Site` when the browser sends it — allows `same-origin`, `same-site`, and `none`; rejects `cross-site`
2. Falls back to `Origin` / `Referer` validation when Fetch Metadata is absent
3. Allows loopback origins during local development (`localhost`, `127.0.0.1`)
4. Does not enable CORS wildcards

Optional: set `STUDIO_ALLOWED_ORIGINS` (comma-separated full origins) when deploying behind a reverse proxy.

Login uses the same middleware. It is safe for the local Studio UI because the browser issues same-origin requests through the Vite dev proxy (`/api` → publish API). Unauthenticated login still benefits from blocking obvious cross-site POST attempts.

This is basic MVP hardening — not a substitute for CSRF tokens, rate limiting, or full production auth on a public deployment.

## Server-only GitHub access

All GitHub API calls run in `apps/studio/server`:

| Endpoint | Token use |
|----------|-----------|
| `POST /api/publish` | Create or update post files |
| `GET /api/posts` | List and load posts from `contentDir` |
| `POST /api/media/upload` | Commit image files to `mediaDir` |
| `GET /api/health/setup` | Safe setup diagnostics (authenticated; no secrets) |

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

Report security concerns privately; do not include live tokens in reports or public issue templates.

When filing bugs, redact tokens, passwords, and private repository details. See [CONTRIBUTING.md](../CONTRIBUTING.md).
