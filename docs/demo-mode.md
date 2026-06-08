# Demo mode

Demo mode lets you explore SourceDraft Studio without GitHub credentials. It is intended for onboarding, smoke tests, screenshots, and local evaluation — not production publishing.

## How to enable

1. **Environment flag:** set `SOURCEDRAFT_DEMO_MODE=true` in `.env` and restart the API, or
2. **Opt-in:** leave `GITHUB_TOKEN`, `GITHUB_OWNER`, and `GITHUB_REPO` unset and click **Explore demo mode** on the sign-in screen.

Start Studio with:

```bash
pnpm dev
```

Use `pnpm dev` from the repository root so both the Vite UI and publish API run together.

## What demo mode does

- Loads **stable seed content** from fixture files in the repository
- Lets you open, edit, and preview sample posts in the browser
- Simulates media upload paths and publish success
- Shows a banner: **Demo mode — no GitHub commits are made**
- Never calls the GitHub API for posts or media, even if credentials exist while `SOURCEDRAFT_DEMO_MODE=true`

## Seed content (fixtures)

Fixture files live under:

- `apps/studio/server/demo/fixtures/posts.ts` — sample MDX posts
- `apps/studio/server/demo/fixtures/media.ts` — sample media metadata

The seed set includes:

| Post | Purpose |
|------|---------|
| Getting started with SourceDraft | Published guide |
| Draft release notes | Draft badge and filters |
| Publishing with images | Inline image Markdown and hero image path |
| Linking and document outline | Headings and internal link examples |

Media fixtures include PNG and PDF metadata with `repoPath`, `publicPath`, `filename`, `extension`, `kind`, and `size`. No binary files are stored in the repo for demo media.

## Session behavior vs API restart

| Event | What happens |
|-------|----------------|
| **API starts** | Demo store reloads from fixture files — same seed every time |
| **During a session** | Edits, simulated publish, and uploads update in-memory state only |
| **API restarts** | In-memory edits are discarded; fixtures load again |
| **GitHub** | No commits are made in demo mode |

Demo edits are **temporary for the running API process**. This is expected. Persisting demo changes across restarts is not a goal for v0.1.

## Security notes

- GitHub tokens and admin passwords stay server-side in `.env`
- `GET /api/health/setup` returns booleans only — never secret values
- Demo mode is not a substitute for production auth hardening

**MVP password auth is intended for local/private use.** Do not expose Studio on the public internet without HTTPS, stronger auth, and deployment hardening.

## Related docs

- [getting-started.md](getting-started.md) — install and first run
- [manual-acceptance-test.md](manual-acceptance-test.md) — release checklist
- [screenshots.md](screenshots.md) — capture guide using demo mode
- [security.md](security.md) — secrets and request protection

## Smoke tests and screenshots

Playwright smoke tests and screenshot generation run against demo mode:

```bash
pnpm exec playwright install chromium   # first time only
pnpm test:e2e
pnpm screenshots:generate              # writes docs/assets/*.png
```

CI runs `pnpm test:e2e` on every push/PR to `main`.
