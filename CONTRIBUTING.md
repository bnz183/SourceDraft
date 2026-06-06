# Contributing

SourceDraft is early-stage software. Keep changes small, typed, and focused.

## Principles

- Universal article schema in core packages
- Adapters for publishing targets, not site-specific hardcoding
- No generic SaaS dashboard patterns or placeholder UI
- Secrets stay server-side

## Docs

Before opening a PR, check whether user-facing behavior needs updates in:

- [README.md](README.md)
- [docs/getting-started.md](docs/getting-started.md)
- [docs/configuration.md](docs/configuration.md)
- [docs/project-status.md](docs/project-status.md)

## Development

```bash
pnpm install
pnpm dev
```

Studio runs the UI and publish API together via `apps/studio`.
