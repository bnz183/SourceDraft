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

## Phase 5 — Plug-and-play onboarding & guided Studio (next focus)

A sanctioned, sequenced UX phase that follows Phase 4. Where Phase 4 polishes
existing surfaces, Phase 5 makes first run **self-configuring and friendly for
nontechnical writers** by surfacing capabilities the codebase already has. It
adds **no** forbidden feature (no billing, telemetry, OAuth, RBAC, hosted
Studio, plugin marketplace, or AI writing) and is measured against
`.claude/rules/ui-standards.md`. Same gates as Phase 4: single-purpose PRs on
their own branches (never pushed to `main`), tests added/updated, no new
dependencies unless justified, secrets server-side, AGPL-3.0-or-later, and
`pnpm build && pnpm test && pnpm test:e2e` green.

This phase reuses the existing detection engine
(`packages/setup/src/detectSetup.ts`) — it surfaces and auto-applies its
results; it does **not** add a new detection system.

### 5a — First-run onboarding wizard (`feat/onboarding-wizard`)

A guided, plain-language first-run flow (new product surface, sanctioned here).

- Staged "one thing per step" wizard shown on first run / when unconfigured.
- Runs existing site detection and reports the result in plain language
  ("We found an Astro site"), with alternatives when ambiguous.
- **Auto-applies** the detected configuration only when the existing
  `isSafeToApplySuggestion()` check passes (confidence ≥70, no warnings), via
  the existing config-generation path — never overwriting a valid existing
  `sourcedraft.config.json` without explicit confirmation.
- Zero-credential demo path stays reachable from every step.
- Tests: Playwright e2e in demo mode; unit tests for extracted first-run/step
  logic.

### 5b — Dashboard destination (`feat/studio-dashboard`)

A status-first landing so users see what is connected before editing.

- New Dashboard destination in the left nav: detected site type, connection
  state (reusing readiness checks), recent posts, and clear primary actions.
- Tests: extend e2e smoke for the new destination and default landing.

### 5c — Plain-language pass (`feat/plain-language`)

- Replace developer jargon (adapter, frontmatter, MDX, repository, contentDir,
  config) in user-facing copy with plain words; keep technical terms behind
  Advanced disclosure. Copy-only; no behavioural change.
- Tests: update affected e2e selectors in the same PR.

### 5d — System status & accessibility verification (`feat/ux-status-a11y`)

- Visible system status on the new surfaces (detected type, connection,
  unsaved, validation, last saved, publish) reusing existing status pieces.
- Verify WCAG 2.2 AA across light **and** dark for the new wizard and
  dashboard; regenerate screenshots; sync `docs/project-status.md` and
  `CHANGELOG.md`.

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
- Large UI redesigns — **except** the sanctioned, sequenced Phase 4 and Phase 5
  UX work above (polish, onboarding, and a guided dashboard on existing
  features; no new forbidden surface)

## Influence the roadmap

Open an issue with the `feature_request`, `adapter_request`, or
`publisher_request` template. Real workflows beat hypotheticals — describe
what you publish, where, and what breaks today.
