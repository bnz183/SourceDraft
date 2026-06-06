# SourceDraft Studio

Browser-based editor for SourceDraft. Pairs with the publish API in `server/`.

## Run from repo root

```bash
pnpm dev
```

Starts Studio and the API together. Configure the parent repo’s `sourcedraft.config.json` and `.env` before signing in.

## Scripts (this package)

| Command | Purpose |
|---------|---------|
| `pnpm dev` | UI + publish API (via root `pnpm dev`) |
| `pnpm dev:web` | UI only (publish disabled) |
| `pnpm dev:server` | API only |
| `pnpm build` | Production UI build |

Setup and publishing: [../../docs/getting-started.md](../../docs/getting-started.md)
