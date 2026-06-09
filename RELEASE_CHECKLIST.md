# SourceDraft v0.1 release checklist

Use this before tagging `v0.1.0` or promoting the repository publicly.

## Automated checks

```bash
pnpm install --lockfile-only
pnpm build
pnpm test
```

- [ ] All three commands exit 0
- [ ] Studio build includes server TypeScript (`tsc -p server/tsconfig.json` in `apps/studio` build)
- [ ] CI workflow (`.github/workflows/ci.yml`) runs the same build and test commands

## Repository

- [ ] `LICENSE` present (AGPL-3.0-or-later)
- [ ] `CHANGELOG.md` has a `v0.1.0` section
- [ ] `CONTRIBUTING.md` present
- [ ] `.env` and `.env.local` are gitignored and not committed
- [ ] No real tokens or passwords in tracked files
- [ ] `sourcedraft.config.example.json` is generic (no site-specific secrets)
- [ ] No QuBrite hardcoding in `*.ts` / `*.tsx` app logic

## Documentation

- [ ] README quickstart matches current Studio UI and commands
- [ ] Docs state: early local/private MVP, not hosted SaaS, not production multi-user auth
- [ ] GitHub Contents API limits documented
- [ ] `mediaDir` vs `publicMediaPath` documented
- [ ] Issue templates present under `.github/ISSUE_TEMPLATE/`

## Manual acceptance

Run [docs/manual-acceptance-test.md](docs/manual-acceptance-test.md) against a **test** GitHub repository.

- [ ] Login and logout work
- [ ] Settings show adapter, `contentDir`, `mediaDir`, `publicMediaPath`
- [ ] Create post, upload image, publish
- [ ] Edit existing post, publish update
- [ ] Verify files in GitHub match expectations

## Tagging (optional)

```bash
git tag -a v0.1.0 -m "SourceDraft v0.1.0 — early open-source MVP"
git push origin v0.1.0
```

Only tag after automated checks pass and manual acceptance is satisfactory.

## Known non-goals for v0.1

Do not block release on: OAuth, user accounts, hosted SaaS, Cloudinary/S3/R2, Git Trees API, screenshots in repo, or Studio E2E test automation.
