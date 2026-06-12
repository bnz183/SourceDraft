# Contributing roadmap

Concrete, scoped ways to contribute, ordered roughly by ramp-up cost. Read
[CONTRIBUTING.md](../CONTRIBUTING.md) first for setup, branch workflow, and
test requirements. When in doubt, open an issue before writing code.

## Good first issues

Small, self-contained, low-risk:

- Fix unclear or outdated wording in any `docs/*.md` (file a PR directly)
- Improve a server-side error message to name the fix, not just the failure
- Add a unit test for an untested pure helper in `packages/*`
- Improve an empty state or loading message in Studio
- Add a troubleshooting row to [getting-started.md](getting-started.md) for a
  problem you actually hit

## Documentation tasks

- A quickstart recipe for a framework/host combination you use
  ([quickstart-recipes.md](quickstart-recipes.md))
- Walkthrough improvements informed by a real first-run experience — note
  where you got stuck, then fix that spot
- Verify a compatibility matrix row against the code and correct drift
- Translate confusing Git/CMS jargon into plainer language in
  [non-technical-overview.md](non-technical-overview.md)

## Adapter tasks

Adapters are the friendliest code contribution — one package, clear
interface, pure functions, easy tests. See the interface in
[compatibility-roadmap.md](compatibility-roadmap.md) and copy the structure
of `packages/adapter-hugo-markdown`.

- New adapter for a framework you run (propose via the adapter request
  template first — include frontmatter format, path conventions, field
  mapping)
- Additional `adapterOptions` for existing adapters where a real site needs
  them (keep options minimal)
- `fromFrontmatter` edge cases: posts with unusual-but-valid frontmatter
  that fail to load today, with tests

## Publisher tasks

Heavier — network APIs, capability declarations, error mapping:

- **Post list/read for Bitbucket, WordPress, Ghost** (top roadmap item —
  makes the Posts sidebar work for those targets)
- Clearer mapped errors from publisher APIs (rate limits, permissions,
  protected branches)
- New publisher proposals via the publisher request template — include the
  official API docs and auth model

## Testing tasks

- Unit tests for uncovered registry/server logic
- Playwright smoke tests for flows demo mode already exercises (keep them
  credential-free and deterministic)
- Edge-case tests: huge bodies, unicode slugs, empty optional fields,
  unusual dates

## Security hardening tasks

Use the security hardening issue template. Genuinely useful areas:

- Durable session storage (in-memory today)
- CSRF token support beyond `Sec-Fetch-Site`/`Origin` checks
- Stricter upload validation or content sniffing improvements
- Reverse-proxy deployment guidance (HTTPS, headers, `STUDIO_ALLOWED_ORIGINS`)

For exploitable vulnerabilities, **do not open an issue** — follow
[SECURITY.md](../SECURITY.md).

## Maintainer expectations

What you can expect:

- Best-effort issue/PR responses — this is a solo-maintained project; days,
  not hours
- Honest review: small focused PRs get reviewed quickly; large unsolicited
  refactors may be declined even if good
- Security reports prioritized over features

What is expected of you:

- `pnpm build` and `pnpm test` pass before requesting review; `pnpm test:e2e`
  when UI/auth/publish flows change
- Stay in scope: no monetization, telemetry, OAuth/RBAC, hosted features, or
  dependency additions without prior discussion (see [roadmap.md](roadmap.md)
  "Explicitly not now")
- No secrets in code, fixtures, screenshots, issues, or commits
- Contributions are licensed AGPL-3.0-or-later
