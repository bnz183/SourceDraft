# Security

## Secrets stay on the server

All credentials are read from `.env` in the publish API only. Studio stores a session cookie after login — never tokens or passwords in the browser.

| Secret | Used for |
|--------|----------|
| `SOURCEDRAFT_ADMIN_PASSWORD` | Studio login |
| `GITHUB_*` | GitHub Contents API (publish, list, media) |
| `GITLAB_*` | GitLab Repository Files API |
| `BITBUCKET_*` | Bitbucket commit-upload API |
| `WORDPRESS_*` | WordPress REST API |
| `GHOST_*` | Ghost Admin API |
| `CLOUDINARY_*` | Cloudinary upload API |
| `S3_*` | S3-compatible config validation (upload not implemented) |
| `DEPLOY_HOOK_URL` | Post-publish build webhook |

Never commit `.env`. Never put secrets in `sourcedraft.config.json`.

## Demo mode

When `SOURCEDRAFT_DEMO_MODE=true` or the active publisher is not fully configured:

- Sample posts load from server fixtures — not your repository.
- `POST /api/publish` and `POST /api/media/upload` simulate success and **never call remote APIs**.
- Forced demo mode blocks all remote writes even if credentials are set.

Use demo mode for local exploration and smoke tests only.

## Session cookies (MVP)

After login, the server sets an in-memory session cookie:

| Attribute | Behavior |
|-----------|----------|
| `HttpOnly` | JavaScript cannot read the cookie |
| `SameSite=Lax` | Limits cross-site cookie use |
| `Secure` | When HTTPS (`NODE_ENV=production`, `X-Forwarded-Proto: https`, or `STUDIO_SECURE_COOKIES=true`) |
| `Max-Age` | 24 hours |

Sessions reset when the API process restarts. This is not durable account auth.

## Request protection for state-changing routes

Protected routes include login, logout, publish, and media upload. Middleware checks `Sec-Fetch-Site` or `Origin`/`Referer` and rejects obvious cross-site POSTs. Optional `STUDIO_ALLOWED_ORIGINS` for reverse-proxy deployments.

This is basic MVP hardening — not a substitute for CSRF tokens, rate limiting, or production auth on a public deployment.

## Server-only publisher access

All publisher and media API calls run in `apps/studio/server`:

| Endpoint | Credentials |
|----------|-------------|
| `POST /api/publish` | Active publisher token |
| `GET /api/posts` | Git publisher only (GitHub, GitLab) |
| `POST /api/media/upload` | Media provider + git publisher when needed |
| `GET /api/media` | Git-backed media list |
| `GET /api/health/setup` | Safe diagnostics (no secret values) |

The client sends article JSON or multipart uploads. The server attaches credentials from `.env`.

Do not import publisher packages in browser code.

## Per-publisher notes

**GitHub / GitLab / Bitbucket** — Tokens need repository write access for publish and media. Use fine-scoped tokens where your host allows. Rotate on leak.

**WordPress** — Application passwords (not your main account password). REST API over HTTPS only. SEO plugin meta requires explicit opt-in via `publisherOptions`.

**Ghost** — Admin API key (`id:secret`) is full admin access to content. Store only on the server.

**Cloudinary** — API secret must not reach the browser. Uploaded images are public CDN URLs by default.

**Deploy hooks** — Treat hook URLs like passwords; anyone with the URL can trigger builds.

## Media uploads

Uploads validate allowed types, size limits (5 MB images, 10 MB PDF), and file signatures. Filenames are sanitized; path traversal is blocked. No SVG, HTML, executables, or ZIP.

Details: [media.md](media.md)

## Plugins

Custom plugins load only on the server at API startup. Review third-party plugin code before enabling — plugins can register publishers with network access.

Details: [plugins.md](plugins.md)

## Files

- Commit `sourcedraft.config.json` (no secrets)
- Never commit `.env` or `.env.local`
- Do not paste tokens into public issues

## Studio auth (MVP)

Single shared password, in-memory sessions.

**Intended for local/private use.** Do not expose Studio publicly without HTTPS, stronger auth, and deployment hardening.

Report security concerns privately; redact tokens in bug reports. See [CONTRIBUTING.md](../CONTRIBUTING.md).
