# CLAUDE.md

Guidance for AI assistants working in this repository. Detailed rules live in
`.claude/rules/`.

## What SourceDraft is

An open-source (AGPL-3.0-or-later) publishing Studio for Markdown, MDX, and
Git-backed content workflows. A local React Studio plus a server-side publish
API commit content and media to the user's own target — GitHub, GitLab,
Bitbucket, WordPress, or Ghost — through an adapter/publisher architecture.

- **Adapters** render a validated universal article into platform-specific
  file output (Astro MDX, Hugo, Docusaurus, MkDocs, Nuxt Content, …).
- **Publishers** send content to a target (Git file commit or remote CMS API).
- Content stays portable: plain `.md`/`.mdx` files in the user's repository.

Status: early local/private MVP. Honest about limitations — see
`docs/project-status.md`. QuBrite.com is the origin story only, never a
dependency or hardcoded target.

## Repository layout

| Path | Contents |
|------|----------|
| `apps/studio` | React Studio UI + Express publish API (`server/`) |
| `packages/core` | Universal article schema and validation |
| `packages/adapter-*` | One package per file adapter (8 shipped) |
| `packages/adapters` | `adapterRegistry` |
| `packages/publishers` | `publisherRegistry` (GitLab, Bitbucket, WP, Ghost) |
| `packages/github-publisher` | GitHub Contents API client |
| `packages/media-providers` | Git media, Cloudinary, S3 (config-only) |
| `packages/plugins` | Server-side plugin loader |
| `packages/setup` | Setup wizard + config validation CLI |
| `examples/*` | Folder-layout integration examples (not runnable sites) |
| `docs/` | All user and contributor documentation |

## Commands

```bash
pnpm install          # workspace install (pnpm 11+, Node 22+)
pnpm dev              # Studio UI + publish API
pnpm build            # build everything incl. studio server TS
pnpm test             # unit tests across packages + studio
pnpm test:e2e         # Playwright smoke tests (demo mode, no credentials)
pnpm setup            # guided config wizard
pnpm validate:config  # validate sourcedraft.config.json + .env
```

Run `pnpm build` and `pnpm test` before finishing any code change. Run
`pnpm test:e2e` when Studio UI, auth, demo mode, or publish flows change.

## Hard rules

1. **Secrets stay server-side.** Tokens, passwords, and API keys are read from
   `.env` in `apps/studio/server` only. Never import publisher packages or
   reference credentials in browser code. Never commit `.env`/`.env.local`.
2. **License is AGPL-3.0-or-later** everywhere. No MIT references.
3. **No scope creep** — see `.claude/rules/no-scope-creep.md`. No billing,
   paywalls, telemetry, OAuth, RBAC, team accounts, hosted/multi-tenant
   Studio, plugin marketplace, or AI writing features.
4. **No fabrication.** No fake screenshots, metrics, benchmarks, testimonials,
   or placeholder features. Docs must describe what the code actually does.
5. **No new dependencies** unless absolutely necessary and justified in the
   PR description.
6. **Honest status.** SourceDraft is an early local/private MVP, not a hosted
   SaaS or production multi-user product. Keep all docs consistent with
   `docs/project-status.md` (shipped / experimental / not shipped).
7. **No QuBrite hardcoding** in app logic. Generic core, per-site config.
8. **Do not push to `main`.** PRs only; CI and CodeQL must pass.

## Code style

- TypeScript, small typed modules, boring reliable code over clever
  abstractions.
- New adapters/publishers go through the registries; follow the interfaces in
  `docs/compatibility-roadmap.md`.
- Unit tests with `node --test` next to the source (`*.test.ts`).
- Match existing comment density (low); no comments that restate code.

## Docs style

See `.claude/rules/docs-style.md`. Short version: precise, technical,
trustworthy; respectful toward Decap/Tina/CloudCannon/WordPress/Ghost;
no SaaS hype, no overclaims; every feature claim must match shipped code.

## Release gates

See `.claude/rules/release-gates.md` and `RELEASE_CHECKLIST.md` before
tagging or promoting anything publicly.
