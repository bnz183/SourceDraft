# Project status

Early open-source MVP — usable for single-editor writing and GitHub publishing, not a full hosted CMS.

## What works

- Studio editor with universal article fields
- Post list and edit from GitHub (`contentDir`) for normal content folders
- Validation (`@sourcedraft/core`)
- Live preview for `astro-mdx` and `markdown` adapters
- GitHub file create/update for posts and media (`@sourcedraft/github-publisher`)
- Clearer GitHub API error messages for token, repo, path, and Contents API limits
- Image upload from Studio (PNG, JPEG, GIF, WebP; 5 MB max) with configurable `publicMediaPath`
- `sourcedraft.config.json` + `.env` configuration
- Server-side password auth for Studio and API
- **Demo mode** with sample posts and simulated publish/upload (no GitHub writes)
- **Setup health** checks in Settings and `GET /api/health/setup`
- CI: build and unit tests on push/PR
- Optional Playwright smoke tests (demo mode, local only — not in CI yet)

## What does not work yet

| Area | Today |
|------|--------|
| Auth | One shared password; no OAuth or accounts |
| Sessions | In-memory; lost when API restarts |
| Hosting | You run Studio locally or on your own server |
| Publishers | GitHub Contents API only (no Git Trees API yet) |
| Large repos | Directory listings capped at 1000 entries per folder; inline files capped at ~1 MB |
| Adapters | `astro-mdx` and `markdown` only |
| Media | GitHub repo uploads only; no Cloudinary/S3/R2 |
| Teams | No roles, review workflow, or multi-editor accounts |
| Demo mode | In-memory sample content; resets on API restart; not a hosted demo SaaS |

## Known limitations (demo mode)

- Sample posts and simulated commits stay in server memory for the session/process.
- `SOURCEDRAFT_DEMO_MODE=true` disables all GitHub writes even if a token is configured.
- Demo mode is for exploration and smoke tests, not production publishing.

## Known MVP limitations (GitHub)

- **Contents API scale:** fine for small and medium blogs; very large content trees may be slow or hit listing limits.
- **No indexer:** post list walks the repo via the Contents API — no database or search index.
- **Future improvement:** Git Trees API or indexed content listing for large sites.

## Intended use

Open-source tool for developers and technical bloggers who accept these limits. Setup required — not a turnkey WordPress replacement or hosted writing product.

## Origin

Built first for [QuBrite.com](https://qubrite.com). Core code stays generic; each site uses its own config and GitHub target.

Publishing flow: [github-publishing.md](github-publishing.md) · Media: [media.md](media.md)

Contributing: [../CONTRIBUTING.md](../CONTRIBUTING.md) · Releases: [../CHANGELOG.md](../CHANGELOG.md)
