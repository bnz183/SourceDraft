# SourceDraft

SourceDraft is an open-source Git-based CMS for Markdown and MDX publishing.

It is designed for static blogs, technical publications, and writers who want a clean publishing workflow without a heavy WordPress-style backend.

## Current goal

Build a portable CMS with:

- Universal article schema
- Astro MDX adapter first
- GitHub publishing
- Studio editor UI
- Adapter-based architecture for future platforms

## Configuration

SourceDraft uses two configuration layers:

1. **`sourcedraft.config.json`** — project settings (adapter, paths, categories)
2. **`.env`** — secrets and optional overrides (`GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`)

Copy the example config:

```bash
cp sourcedraft.config.example.json sourcedraft.config.json
```

Copy environment variables:

```bash
cp .env.example .env
```

See [docs/configuration.md](docs/configuration.md) for precedence, field reference, and Studio setup.

## Planned adapters

- Astro MDX
- Next.js MDX
- Hugo Markdown
- WordPress REST API
- Ghost API

## Status

Early MVP.
