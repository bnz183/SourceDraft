# Security

## Secrets stay on the server

- `GITHUB_TOKEN` — used only in the publish API when committing files
- `SOURCEDRAFT_ADMIN_PASSWORD` — checked only on the server at login

Studio stores a session cookie after login. It does not store the GitHub token or admin password in the browser.

## Publishing path

All GitHub API calls run in `apps/studio/server`. The client sends article JSON to `/api/publish`; the server attaches credentials from `.env`.

Do not import `@sourcedraft/github-publisher` in browser code.

## Files

- Commit `sourcedraft.config.json` (no secrets)
- Never commit `.env` or `.env.local`
- Do not paste tokens into public issues

## Studio auth (MVP)

Single shared password, in-memory sessions. Suitable for local or trusted single-editor use — not a multi-tenant production auth system yet.

Report security concerns privately; do not include live tokens in reports.
