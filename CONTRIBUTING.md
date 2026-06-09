# Contributing

SourceDraft is early-stage. Prefer small, typed changes over large refactors.

## Principles

- Universal article schema in `@sourcedraft/core`
- Site-specific values in config files, not hardcoded in packages
- No generic SaaS UI patterns, fake metrics, or placeholder screens
- Secrets only in server code and `.env`

## Docs

Update user-facing docs when behavior changes:

- [README.md](README.md)
- [docs/getting-started.md](docs/getting-started.md)
- [docs/github-publishing.md](docs/github-publishing.md)
- [docs/configuration.md](docs/configuration.md)
- [docs/project-status.md](docs/project-status.md)

## Development

```bash
pnpm install
pnpm dev
```

Runs Studio and the publish API from the repo root.
