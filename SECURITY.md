# Security Policy

SourceDraft is an early open-source MVP intended for **local or private**
deployments. Its threat model and current limitations are documented in
[docs/security.md](docs/security.md) — read that first.

## Reporting a vulnerability

Please do **not** open a public issue for security vulnerabilities.

Report privately via [GitHub Security Advisories](https://github.com/bnz183/SourceDraft/security/advisories/new)
("Report a vulnerability" on the repository's Security tab).

Include where practical:

- Affected area (Studio UI, publish API, a specific publisher/adapter/media provider)
- Reproduction steps or proof of concept
- Impact assessment (what an attacker gains)

You should receive an initial response within 7 days. This is a small
maintainer-run project — fixes are best-effort but security reports are
prioritized over feature work.

## Scope notes

Known, documented MVP limitations are not considered vulnerabilities on their
own (but bypasses of the documented protections are):

- Single shared password auth with in-memory sessions (local/private use only)
- No CSRF tokens — `Sec-Fetch-Site`/`Origin` checks instead
- Studio is not hardened for public internet exposure

## Handling secrets

- GitHub/GitLab/Bitbucket tokens, WordPress/Ghost/Cloudinary credentials, and
  the admin password live in `.env` and are read **server-side only**.
- Never commit `.env` or `.env.local`; never paste tokens, passwords, or
  private repository details into issues, PRs, or screenshots.
- If you accidentally expose a token, revoke and rotate it immediately.

## Automated checks

CI runs build, unit tests, and Playwright smoke tests; GitHub CodeQL analyzes
JavaScript/TypeScript and Actions workflows on pushes and PRs to `main`.
