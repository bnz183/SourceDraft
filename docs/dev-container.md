# Dev Container (optional — VS Code / Cursor)

Open SourceDraft in a Dev Container for a reproducible environment: Node 22, pnpm 11.1.2, Playwright Chromium dependencies, git, and GitHub CLI.

**Default setup:** local `pnpm install && pnpm dev` or `pnpm demo` — no Docker required. Use a Dev Container only if you prefer an isolated environment.

## Prerequisites

- Docker Desktop or Docker Engine + Compose
- VS Code with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers), or **Cursor** with dev container support

## Open in a container

1. Clone the repository.
2. Open the folder in Cursor or VS Code.
3. Command Palette → **Dev Containers: Reopen in Container** (or accept the prompt when opening the repo).

The container builds from `.devcontainer/Dockerfile`, mounts your workspace at `/workspace`, and runs:

```bash
pnpm install && pnpm --filter studio exec playwright install chromium
```

Ports **5173** (Studio) and **8787** (API) are forwarded automatically.

## Secrets and config

| File | Location |
|------|----------|
| `.env` | Repository root on your **host** (bind-mounted). Copy from `.env.example`. Never commit. |
| `sourcedraft.config.json` | Repository root. Safe to commit (no secrets). |

Run `pnpm setup` inside the container if you prefer the guided wizard.

For demo exploration without credentials, set `SOURCEDRAFT_DEMO_MODE=true` in `.env` or enable **Demo mode** on the sign-in screen and **Continue in demo**.

## Daily commands

From the integrated terminal (`/workspace`):

```bash
pnpm dev                              # Studio + publish API
pnpm build                            # build all packages
pnpm test                             # unit tests
pnpm lint                             # ESLint (Studio)
pnpm --filter studio test:e2e         # Playwright smoke tests
pnpm validate:config                  # config validation
pnpm setup                            # setup wizard
```

Studio URL: **http://localhost:5173** (forwarded from the container).

## File ownership

`updateRemoteUserUID` is enabled so the `node` user inside the container matches your host UID on Linux, reducing permission issues on bind-mounted files.

If you still see root-owned files, fix ownership on the host once:

```bash
sudo chown -R "$(id -u):$(id -g)" .
```

## What's installed

- Node.js 22 (Debian bookworm-slim)
- pnpm 11.1.2 via Corepack
- Playwright Chromium system libraries (+ browser via `postCreateCommand`)
- git, curl, GitHub CLI (`gh`)

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| Rebuild after Dockerfile changes | Command Palette → **Dev Containers: Rebuild Container** |
| `pnpm` not found | Rebuild container; Corepack activates pnpm 11.1.2 in the image |
| Playwright browsers missing | `pnpm --filter studio exec playwright install chromium` |
| Port forward not working | Check **Ports** panel; ensure nothing else uses 5173/8787 on the host |

See also: [docker.md](docker.md) · [getting-started.md](getting-started.md)
