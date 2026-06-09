# SourceDraft release checklist

Use this before tagging a public release or promoting the repository.

## Automated checks

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm test:e2e
```

- [ ] All four commands exit 0
- [ ] Studio build includes server TypeScript (`tsc -p server/tsconfig.json` in `apps/studio` build)
- [ ] CI workflow (`.github/workflows/ci.yml`) runs build, test, and studio-e2e on pull requests
- [ ] **CodeQL** checks pass on the release PR (JavaScript/TypeScript + Actions; no open high-severity alerts)

## Repository hygiene

- [ ] `LICENSE` present (**AGPL-3.0-or-later**)
- [ ] `CHANGELOG.md` updated for the release version
- [ ] `CONTRIBUTING.md` present
- [ ] `.env` and `.env.local` are gitignored and **not committed**
- [ ] **No secrets check:** scan tracked files for tokens, passwords, or private keys (`rg -i 'ghp_|gho_|GITHUB_TOKEN=|password=' --glob '!*.example*'`)
- [ ] `sourcedraft.config.example.json` is generic (no site-specific secrets)
- [ ] No QuBrite hardcoding in `*.ts` / `*.tsx` app logic

## Documentation

- [ ] README describes Git-based Markdown/MDX publishing, adapters, publishers, PR publishing, editor, setup detection, content QA, and license
- [ ] Docs state: early local/private MVP, not hosted SaaS, not production multi-user auth
- [ ] GitHub Contents API limits documented
- [ ] `mediaDir` vs `publicMediaPath` documented
- [ ] Issue templates present under `.github/ISSUE_TEMPLATE/`

## Screenshots

```bash
pnpm screenshots:generate
```

- [ ] Regenerate Studio screenshots when UI changed materially
- [ ] Commit updated images under `docs/assets/` if diffs are intentional

## Smoke tests

### Demo mode (automated)

`pnpm test:e2e` covers demo login, editor, settings panels, publish simulation, and publish checklist.

- [ ] E2E green locally and in CI

### Protected-branch PR publishing (manual)

On a **test** GitHub repo with branch protection on `main`:

- [ ] Set `SOURCEDRAFT_PUBLISH_MODE=pull-request` in `.env`
- [ ] Publish a valid post from Studio
- [ ] PR is created with expected file path and branch prefix
- [ ] Optional: repeat with `draft-pull-request`

Details: [docs/github-pr-publishing.md](docs/github-pr-publishing.md)

## Manual acceptance

Run [docs/manual-acceptance-test.md](docs/manual-acceptance-test.md) against a test GitHub repository.

- [ ] Login and logout work
- [ ] Settings show setup detection, content audit, and setup health
- [ ] Create post, upload image, publish (direct mode)
- [ ] Edit existing post, publish update
- [ ] Verify files in GitHub match expectations

## Tagging (optional)

```bash
git tag -a v0.1.0 -m "SourceDraft v0.1.0 — early open-source MVP"
git push origin v0.1.0
```

Only tag after automated checks pass and manual acceptance is satisfactory.

## Known non-goals (document, do not block release)

- OAuth, user accounts, hosted SaaS, team RBAC
- Full S3/R2 media upload (`s3-compatible` config validation only)
- Post list in Studio for Bitbucket, WordPress, and Ghost
- Git Trees API indexer for very large repos

Roadmap: [docs/compatibility-roadmap.md](docs/compatibility-roadmap.md)
