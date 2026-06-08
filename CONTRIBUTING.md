# Contributing to SourceDraft

Thank you for helping improve SourceDraft. This project is an early open-source MVP for Git-backed Markdown and MDX publishing — not a hosted SaaS product.

## Local setup

Requirements:

- Node.js 22+
- pnpm 11+

```bash
git clone https://github.com/bnz183/SourceDraft.git
cd SourceDraft
pnpm install

cp sourcedraft.config.example.json sourcedraft.config.json
cp .env.example .env
```

Edit `.env` with local values for development. **Do not commit `.env` or `.env.local`.**

`GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, and `SOURCEDRAFT_ADMIN_PASSWORD` are read only by the Studio server (`apps/studio/server`). They must never be added to client code, issue reports, or screenshots.

## Branch workflow

1. Fork the repository (or create a branch if you have write access).
2. Branch from `main` with a short descriptive name, for example `fix/post-list-error` or `docs/contributing`.
3. Keep changes focused — avoid unrelated refactors.
4. Open a pull request against `main` with a clear summary and test notes.

Before a release, see [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) and [docs/manual-acceptance-test.md](docs/manual-acceptance-test.md).

## Commands

From the repository root:

```bash
pnpm install    # install workspace dependencies
pnpm build      # build all packages and Studio (including server TypeScript)
pnpm test       # run unit tests
pnpm dev        # start Studio UI + publish API locally (http://localhost:5173)
pnpm demo       # demo mode — no publisher credentials required
```

Docker is optional. See [docs/docker.md](docs/docker.md) if you prefer Compose or a Dev Container.

Optional:

```bash
pnpm lint       # lint workspace packages where configured
pnpm check      # TypeScript check without emit
```

CI runs `pnpm install --frozen-lockfile`, `pnpm build`, and `pnpm test` on push and pull requests.

## What to contribute

Good first contributions:

- Documentation fixes and clarity
- Tests for pure helpers in `packages/*`
- Clearer error messages (server-side)
- Bug fixes with a small, focused diff

Please avoid:

- Hardcoding site-specific logic (QuBrite or any single publication)
- Exposing secrets or tokens in browser code
- Large refactors without an issue discussion first
- Fake features, metrics, or placeholder UI

## Reporting issues

Use the GitHub issue templates:

- [Bug report](.github/ISSUE_TEMPLATE/bug_report.md)
- [Feature request](.github/ISSUE_TEMPLATE/feature_request.md)

Do not paste live tokens, passwords, or private repository details in public issues.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
