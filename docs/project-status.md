# Project status

Early open-source MVP — usable for solo writing and publishing to Git or remote CMS APIs. Not a hosted multi-user CMS.

**Honest summary:** SourceDraft ships eight file adapters, five publishers, two production media providers (plus experimental S3 config), deploy hooks, SEO fields, a setup wizard, demo mode, and a plugin loader for custom connectors. It does **not** ship OAuth, team roles, hosted Studio, or full S3/R2 uploads yet.

## Shipped (production-ready for local/private use)

| Area | Status |
|------|--------|
| **Studio** | Tiptap editor + slash commands + source mode, inline link/image/file dialogs, post list (git publishers), media library (git-backed), preview, SEO panel, content QA, publish checklist, setup detection, content audit, setup/compatibility health |
| **Studio UI** | Tokenized design system with light **and** dark themes (system default + manual toggle, persisted), left navigation rail, sticky top bar, anchored primary Publish action, and staged settings/onboarding — targeting WCAG 2.2 AA |
| **Adapters** | `astro-mdx`, `markdown`, `nextjs-mdx`, `hugo-markdown`, `eleventy-jekyll-markdown`, `docusaurus-mdx`, `mkdocs-markdown`, `nuxt-content-markdown` |
| **Publishers** | `github`, `gitlab`, `bitbucket`, `wordpress`, `ghost` (GitHub PR publish modes: direct, pull-request, draft-pull-request) |
| **Media** | `github-media` (images + PDF), `cloudinary` (images) |
| **Deploy hooks** | `generic`, `vercel`, `netlify`, `cloudflare-pages` |
| **Config** | `sourcedraft.config.json` + `.env`, `pnpm setup`, `pnpm validate:config` |
| **Plugins** | Server-side loader for custom adapters/publishers/media providers |
| **SEO** | Optional frontmatter + Studio validation; WordPress/Ghost field mapping |
| **Auth** | Single shared password, HttpOnly session cookie (MVP) |
| **Demo mode** | Fixture posts, simulated publish/upload, Playwright smoke tests |
| **CI** | Build, typecheck, unit tests, e2e on push/PR |
| **Docs** | Getting started, recipes, per-connector guides, Studio screenshots in `docs/assets/` |

## Experimental / partial

| Area | Status |
|------|--------|
| `s3-compatible` media | Env validation only — **upload not implemented**; use `github-media` or `cloudinary` |
| Bitbucket publisher | Publish + media work; **no post list/read in Studio** yet |
| WordPress / Ghost | Publish + update with `remoteId`; **no post list in Studio**; body is Markdown/plain (Ghost uses `?source=html`) |
| Sessions | In-memory — lost when API restarts |
| Git listing scale | Contents API walk; ~1000 entries per folder; inline files ~1 MB |

## Not shipped

| Area | Notes |
|------|-------|
| Hosted Studio SaaS | You run locally or on your own server |
| OAuth / user accounts / RBAC | One password for all Studio users |
| Markdown → HTML converter | Remote CMS publishers send body as-is |
| Media delete/rename in Studio | Upload + list only |
| Git Trees API indexer | Future improvement for very large repos |
| Guided onboarding wizard & dashboard | Planned (roadmap Phase 5). The site-detection engine exists (`packages/setup/src/detectSetup.ts`) and is reachable today via Advanced Settings; a first-run wizard and status-first dashboard that surface and auto-apply it are **not built yet** |
| Hotlinked connector screenshots | Official doc links only; see [assets/screenshots/ATTRIBUTION.md](assets/screenshots/ATTRIBUTION.md) |

## Comparison (why SourceDraft vs …)

| Tool | SourceDraft today | Typical alternative |
|------|-------------------|---------------------|
| **Decap CMS** | Local Studio + your publish API; no `admin/config.yml` in the site repo | Git-backed editor embedded in static site |
| **TinaCMS** | File-first, adapter-driven output; no Tina Cloud required | Visual editing with Tina backend or self-hosted |
| **WordPress/Ghost admin** | Optional **publishers** — SourceDraft is not a full WP/Ghost replacement | Native CMS UI and media library |
| **Static dashboard** | Validates universal schema, previews exact file path, multi-adapter | Often framework-specific or hosted |

SourceDraft fits when you want one editor for Markdown/MDX files **or** API publish to WP/Ghost, with secrets on the server only. Full honest comparison: [comparison.md](comparison.md)

## Demo mode

Fixture-backed seed content from `apps/studio/server/demo/fixtures/`. Session edits are in-memory; API restart reloads fixtures. No remote commits when demo is active.

Details: [demo-mode.md](demo-mode.md)

## Intended use

Open-source tool for developers and technical bloggers who accept MVP auth and scale limits. Setup required — not a turnkey WordPress replacement.

## Origin

Built first for [QuBrite.com](https://qubrite.com). Core stays generic; each site uses its own config and publisher target.

## References

- Quickstart recipes: [quickstart-recipes.md](quickstart-recipes.md)
- Adapters matrix: [adapters.md](adapters.md)
- Publishers matrix: [publishers.md](publishers.md)
- Contributing: [../CONTRIBUTING.md](../CONTRIBUTING.md) · Changelog: [../CHANGELOG.md](../CHANGELOG.md)
