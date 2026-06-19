# Roadmap

Where SourceDraft is heading, in honest tiers. Nothing here is a commitment
with a date; items move based on real usage and contributor interest.
Technical extension details live in
[compatibility-roadmap.md](compatibility-roadmap.md).

The free, open-source AGPL version is the product. It will not be
artificially crippled to sell something later.

## Near-term (open-source, current focus)

Improvements to the existing local/private workflow:

- **Post list/read for more publishers** — Bitbucket, WordPress, and Ghost
  can publish but cannot list posts in Studio yet
- **S3/R2 media upload** — `s3-compatible` currently validates config only
- **Git Trees API indexer** — lift the Contents API limits (~1000
  entries/folder, ~1 MB inline files) for large repos
- **Media management** — delete/rename in the media library (upload + list today)
- **Better error surfaces** — keep improving actionable publisher/API errors
- **Docs and onboarding** — quickstart recipes, troubleshooting, more
  framework examples
- **More adapters via community** — see
  [contributing-roadmap.md](contributing-roadmap.md)

## Phase 4 — Studio UX/UI hardening (current focus)

A pre-distribution quality pass so the Studio reads as a finished product, not
a prototype. This is polish and accessibility work on **existing** features —
no new product surface, no scope creep. Every PR below is single-purpose, on
its own branch, opened as a PR (never pushed to `main`), adds or updates tests,
adds **no new dependencies** unless justified in the PR description, keeps
secrets server-side, stays AGPL-3.0-or-later, and must pass
`pnpm build && pnpm test && pnpm test:e2e`.

The pass is sequenced foundation-first so later PRs build on shared tokens.

### 4a — Design-system foundation (`feat/design-system-foundation`)

Shared visual language and app shell. No behavioural changes to publishing.

- 8px spacing scale and radius scale as CSS tokens; replace ad-hoc spacing in
  touched shell components.
- Modular type scale tokens (tighten the existing `--text-*` set; remove
  off-scale `10px`/`11px` usage in touched components).
- Tokenized colour palette meeting WCAG 2.2 AA in **light and dark**
  (`prefers-color-scheme`), including fixing low-contrast `--text-dim` and
  placeholder values.
- Fix the four undefined CSS variables (`--radius-md`, `--surface-raised`,
  `--border-subtle`, `--bg-subtle`).
- Consistent button system; the Publish action becomes a large, anchored,
  high-contrast primary button.
- Sticky top bar and a persistent left nav for Posts/Settings.
- Reduced visual noise; replace ad-hoc hex/spacing in touched components with
  tokens.
- Tests: unit-test any extracted nav/token logic; keep all existing e2e green.

### 4b — Editor (`feat/editor-conventions`)

Bring the editor up to Google-Docs/Notion conventions.

- Replace `window.prompt` link/image/file flows with in-Studio inline UI.
- Consistent icon/label system in the toolbar; stable grouping at all widths;
  ensure ≥24px targets.
- Apply 4a tokens throughout the editor and canvas.
- Tests: extend e2e for the new link/image/file flows; unit-test extracted
  helpers.

### 4c — Onboarding / config (`feat/onboarding-staging`)

Progressive disclosure and one-thing-per-page setup.

- Stage Settings into clear sections/steps; surface publishing readiness as the
  obvious next action.
- Tighten first-run guidance so a new user is oriented within seconds and the
  zero-credential demo path stays front-and-centre.
- Apply 4a tokens to all onboarding/settings surfaces.
- Tests: e2e for the staged settings flow.

### 4d — Final polish / QA (`feat/ux-final-qa`)

- Cross-screen consistency sweep; remove any remaining ad-hoc hex/spacing.
- Verify the success criteria: oriented within seconds, zero-credential first
  run, editor feels complete, WCAG 2.2 AA across light/dark, obvious reachable
  primary actions, shippable look.
- Regenerate screenshots if UI changed (`pnpm screenshots:generate`); update
  `docs/project-status.md` and `CHANGELOG.md` if anything user-visible shifted.

## Later (self-hosted hardening)

For people running Studio beyond a single laptop — still open source:

- Durable sessions (survive API restarts)
- CSRF tokens and stricter request protection suitable for reverse-proxy
  deployments
- Markdown→HTML conversion option for WordPress/Ghost bodies
- Scheduled/draft publishing workflows on top of PR modes
- Optional multi-password or per-writer identification (not full RBAC)

## Future commercial possibilities (not built, not promised)

If SourceDraft earns real adoption, a paid layer could fund maintenance.
Candidates, listed for transparency:

- Hosted **SourceDraft Cloud** (managed Studio + publish API)
- Managed setup/onboarding and migration services
- OAuth, team accounts, RBAC, persistent sessions as managed features
- Managed media storage
- Agency/client workspaces
- Premium/commercial support; possible dual-license arrangements

None of this exists, none of it is scheduled, and none of it will remove
functionality from the open-source version.

## Future: agent-ready publishing workflows

SourceDraft’s structured article schema, validation, preview, and publish
checklist make it a natural base for future AI-assisted workflows where
external agents or automation tools can prepare drafts and humans review
before publishing.

That model is **draft → review → preview → publish**, with human-in-the-loop
editorial control — not autonomous publishing.

**Not shipped today:** Agent API, BYOK AI providers, MCP support, automation
endpoints, and built-in AI writing tools. These are future work. The current
Studio gives you structured article fields, content QA, and a controlled
publish gate that external systems could integrate with later.

## Explicitly not now

Deliberately out of scope in the current phase:

- Paywalls, billing, SaaS plans, license gates
- Telemetry or usage analytics
- OAuth / user accounts / RBAC implementations
- Hosted or multi-tenant Studio
- Plugin marketplace
- AI writing tools, Agent API, BYOK AI, MCP, automation endpoints
- Site hosting or running your static-site build
- Large UI redesigns

## Influence the roadmap

Open an issue with the `feature_request`, `adapter_request`, or
`publisher_request` template. Real workflows beat hypotheticals — describe
what you publish, where, and what breaks today.
