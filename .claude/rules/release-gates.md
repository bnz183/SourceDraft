# Release gates

Before tagging a release, merging release-related PRs, or recommending any
public promotion, all gates below must pass. See `RELEASE_CHECKLIST.md` and
`docs/public-launch-checklist.md` for the full operator checklists.

## Automated gates

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm test:e2e   # required for releases and any UI/auth/publish change
```

- CI (`.github/workflows/ci.yml`) green: build, unit tests, studio e2e
- CodeQL: no open high-severity alerts on the release PR

## Repository hygiene gates

- `LICENSE` is AGPL-3.0-or-later; no stray MIT references anywhere
- `.env` / `.env.local` gitignored and not committed
- No-secrets scan clean on tracked files (tokens, passwords, private keys):
  `git grep -nIiE 'ghp_[A-Za-z0-9]|gho_[A-Za-z0-9]|BEGIN [A-Z]+ PRIVATE KEY' -- ':!*.example*'`
- No QuBrite hardcoding in `*.ts` / `*.tsx` app logic

## Honesty gates

- README, `docs/project-status.md`, and `CHANGELOG.md` agree on shipped vs
  experimental vs not-shipped
- Stated limitations still accurate: MVP password auth, in-memory sessions,
  Contents API scale limits, `s3-compatible` upload not implemented, no post
  list for Bitbucket/WordPress/Ghost
- No screenshots showing tokens, real repo secrets, or personal data
- No production/SaaS/enterprise claims anywhere

## Manual gates (release only)

- Demo mode walkthrough passes (`docs/manual-acceptance-test.md`)
- Real publish against a **test** GitHub repository: direct commit and
  pull-request mode both verified
- Screenshots regenerated (`pnpm screenshots:generate`) if UI changed

If any gate fails, the release stops. Document the failure; do not waive
gates silently.
