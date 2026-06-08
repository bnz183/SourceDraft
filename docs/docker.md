# Docker (optional)

Docker and Docker Compose are an **optional** alternative to local development. The default path is `pnpm install` and `pnpm dev` (or `pnpm demo`) on your machine — see [getting-started.md](getting-started.md).

Use Docker when you want an isolated Node 22 + pnpm 11.1.2 toolchain and Playwright system libraries without installing them on the host.

## Requirements

- Docker Engine 24+ (or Docker Desktop)
- Docker Compose v2

## Quickstart (demo mode)

No publisher credentials required:

```bash
git clone https://github.com/bnz183/SourceDraft.git
cd SourceDraft
docker compose -f docker-compose.yml -f docker-compose.demo.yml up --build
```

Open **http://localhost:5173** → enable **Demo mode**, then **Continue in demo** (default password `admin` — change in `.env`).

Stop:

```bash
docker compose -f docker-compose.yml -f docker-compose.demo.yml down
```

## Quickstart (with your `.env`)

```bash
cp sourcedraft.config.example.json sourcedraft.config.json
cp .env.example .env
# edit .env — never commit this file

docker compose up --build
```

Compose loads `.env` when present (`env_file`, optional). Secrets stay on the host and are injected at runtime — they are **not** baked into the image.

## Ports

| Port | Service |
|------|---------|
| **5173** | Studio (Vite dev server) |
| **8787** | Publish API (Express) |

Override host ports:

```env
STUDIO_PORT=5173
STUDIO_API_PORT=8787
```

## Useful commands

```bash
# Build the dev image
docker compose build

# Foreground (logs in terminal)
docker compose up

# Detached
docker compose up -d

# Demo mode stack
docker compose -f docker-compose.yml -f docker-compose.demo.yml up -d

# Follow logs
docker compose logs -f studio

# Shell inside the running container
docker compose exec studio bash

# Run one-off checks inside the image
docker compose run --rm studio bash -lc "pnpm build && pnpm test && pnpm lint"

# Playwright smoke tests (Chromium installed on first pnpm install in container)
docker compose run --rm studio bash -lc "pnpm install && pnpm --filter studio exec playwright install chromium && pnpm --filter studio test:e2e"

# Stop and remove containers
docker compose down
```

## How it works

- **`Dockerfile`** — Node 22, pnpm 11.1.2 (Corepack), git, GitHub CLI, Playwright Chromium **system** dependencies. Does not copy your repo or `.env`.
- **`docker-compose.yml`** — mounts the repository at `/workspace`, runs `pnpm dev`-equivalent (Vite on `0.0.0.0:5173` + API on `8787`).
- **`docker-compose.demo.yml`** — sets `SOURCEDRAFT_DEMO_MODE=true` and a default demo password.

The container runs as UID/GID **1000** by default (`node` user) to reduce root-owned files on the bind mount. On Linux, match your host user if needed:

```bash
export DOCKER_UID=$(id -u) DOCKER_GID=$(id -g)
docker compose up
```

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| Port already in use | Stop local `pnpm dev` or change `STUDIO_PORT` / `STUDIO_API_PORT`. |
| `permission denied` on `node_modules` | Set `DOCKER_UID` / `DOCKER_GID` to your host user (see above). |
| API unreachable from Studio | Ensure both ports are published; API must listen on 8787 inside the container. |
| Playwright e2e fails in container | Run `pnpm --filter studio exec playwright install chromium` once after `pnpm install`. |
| Changes not visible | Compose bind-mounts the repo — save files on the host; Vite HMR should reload. |
| Want production image | This stack is for **development**. Production deployment is not bundled here. |

See also: [dev-container.md](dev-container.md) · [getting-started.md](getting-started.md) · [demo-mode.md](demo-mode.md)
