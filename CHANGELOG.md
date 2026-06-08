# Changelog

All notable changes to SourceDraft are documented here. The project uses [Semantic Versioning](https://semver.org/) where practical.

## v0.1.0

First public open-source MVP for local/private Git-backed publishing.

### Added

- **Studio editor** for Markdown and MDX posts with universal article fields (title, slug, dates, category, tags, draft, body)
- **Markdown and MDX publishing** via adapters (`astro-mdx`, `markdown`)
- **GitHub publishing** through the Contents API (`@sourcedraft/github-publisher`)
- **Existing post listing and editing** from configured `contentDir`
- **Image uploads** to `mediaDir` (PNG, JPEG, GIF, WebP; 5 MB max)
- **Configurable `publicMediaPath`** — separate repo write path from URL path inserted into posts
- **Universal article validation** (`@sourcedraft/core`)
- **Project configuration** via `sourcedraft.config.json` and `.env` overrides
- **CI baseline** — build and unit tests on push/PR

### Security (MVP)

- Local/private **password auth** with server-side session cookies
- GitHub token and admin password stay on the server only
- Lightweight same-site protection on state-changing API routes

**Warning:** MVP password auth is intended for local or private use. Do not expose Studio publicly without HTTPS, stronger auth, and deployment hardening.

### Known limitations

- GitHub Contents API only (no Git Trees API or content indexer yet)
- In-memory sessions (lost when the API restarts)
- No OAuth, user accounts, or hosted multi-tenant product
- Large content folders may hit GitHub listing or file-size limits

See [docs/project-status.md](docs/project-status.md) for current scope.
