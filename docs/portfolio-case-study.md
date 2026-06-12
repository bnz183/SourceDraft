# SourceDraft — engineering case study

A walkthrough of SourceDraft as a piece of engineering: the problem, the
architecture, the trade-offs, and what was deliberately left out. Written for
engineers, maintainers, and technical founders evaluating the project or its
author.

## The problem

Git-backed static sites (Astro, Hugo, Next.js, Docusaurus, MkDocs, Nuxt
Content, Eleventy/Jekyll) make publishing a developer workflow: hand-write
YAML frontmatter, get the filename convention right, commit, push. That is
fine for developers and hostile to everyone else — and error-prone even for
developers (wrong date format, duplicate slug, missing alt text, broken
frontmatter that fails the site build).

Existing Git-based CMS options solve this with an editor embedded in the
deployed site (Decap), framework-coupled visual editing (Tina), or a hosted
platform that gets write access to your repository (CloudCannon, GitCMS).
Each is a good trade for someone. SourceDraft makes a different one: a
**local Studio with a server-side publish API**, so content stays plain
files in your repo and credentials never leave your own environment.

SourceDraft began as an internal publishing tool for QuBrite.com and was
generalized into an open-source project. QuBrite is the origin story, not a
dependency — nothing in core references it.

## Target users

Solo developers, technical bloggers, documentation maintainers, and small
teams that want Git-owned content with a simpler writing workflow — people
comfortable running `pnpm dev` but tired of hand-editing frontmatter.

## Architecture

```
Studio (React, browser)          — editor, preview, no secrets ever
        │ article JSON / multipart upload
Publish API (Express, server)    — auth, validation, credentials from .env
        │
core ──► adapterRegistry ──► publisherRegistry ──► your target
schema    renders file        commits via Git API   (GitHub, GitLab,
+ validation                  or calls CMS API       Bitbucket, WP, Ghost)
```

The design rests on one schema and two registries:

- **`@sourcedraft/core`** — a universal article schema (title, slug, dates,
  category, tags, draft, body, optional SEO fields) with validation. Every
  feature upstream and downstream speaks this type.
- **`adapterRegistry`** (`@sourcedraft/adapters`) — adapters render a
  validated article into platform-specific output: frontmatter dialect
  (YAML/TOML), field mapping (`pubDate` → `date` → `lastmod`), file
  extension, and path convention (`slug`, `date-slug`, `index`). Adapters
  also parse existing files back into the schema (`fromFrontmatter`), which
  powers editing.
- **`publisherRegistry`** (`@sourcedraft/publishers`) — publishers move
  content to a target and declare `capabilities` (publish, upload media,
  list, read). Unsupported operations return typed `{ ok: false, error }`
  results instead of throwing, so Studio can degrade clearly per target.

Because adapters and publishers are orthogonal, the matrix multiplies
instead of adding: 8 adapters × 5 publishers from one editor, plus a
server-side plugin loader (`@sourcedraft/plugins`) for custom connectors
without forking.

## Monorepo layout

| Workspace | Role |
|-----------|------|
| `apps/studio` | React Studio UI + Express publish API |
| `packages/core` | Universal article schema and validation |
| `packages/adapter-*` (×8) | One package per framework adapter |
| `packages/adapters`, `packages/publishers` | Registries |
| `packages/github-publisher` | GitHub Contents API client (commit, PR, draft-PR modes) |
| `packages/media-providers` | Git media, Cloudinary, S3-compatible (config-only) |
| `packages/plugins` | Server-side plugin loader |
| `packages/setup` | Interactive setup wizard + config validation CLI |
| `examples/*` (×7) | Folder-layout integration references per framework |

Plain TypeScript, `node --test` unit tests colocated with source, no
framework beyond React/Express/Tiptap. Boring on purpose.

## Security model

The central invariant: **secrets exist only in `.env`, read only by the
publish API**. Browser code never imports publisher packages.

- Auth: single shared password (scrypt hash preferred, plaintext fallback for
  local dev), HttpOnly `SameSite=Lax` session cookies, in-memory sessions.
- State-changing routes check `Sec-Fetch-Site`/`Origin`; rate limiting on
  auth, publish, media, and read endpoints.
- Media uploads validate MIME type, size, and file signatures; filenames are
  sanitized; path traversal blocked; no SVG/HTML/executables.
- Setup health endpoint reports config *presence* booleans, never values.
- Demo mode is a hard gate: when forced on, publish and upload simulate
  success and remote calls never happen, even with credentials present.

The docs say plainly what this is: MVP hardening for local/private use, not
production multi-user auth. That transparency is part of the design.

## Quality engineering

- CI on every push/PR: `pnpm build`, unit tests across all packages, and
  Playwright e2e smoke tests that run entirely in demo mode — so CI needs no
  live credentials and tests are deterministic from fixtures.
- GitHub CodeQL on JS/TS and Actions workflows.
- README screenshots are *generated* by Playwright from demo fixtures
  (`pnpm screenshots:generate`) — reproducible, never staged or faked.
- A release checklist, manual acceptance script, and per-connector docs with
  capability matrices that state what does **not** work.

## Product-side details worth noting

- **Publish confidence loop:** validation → content QA warnings (SEO, alt
  text, headings, links) → preview of the exact output file and repo path →
  publish checklist → publish, optionally as a PR against protected branches.
- **Setup detection:** scans a local project to suggest adapter and paths;
  **content audit** scans existing posts read-only before you trust the tool
  with them.
- **Demo mode** doubles as onboarding (try Studio with zero credentials) and
  as the e2e test substrate.

## Trade-offs and honest limitations

| Decision | Cost accepted |
|----------|---------------|
| Local Studio + own API instead of hosted | No multi-user, no client access; you run it yourself |
| Shared-password MVP auth | Not safe for public exposure; in-memory sessions reset on restart |
| GitHub Contents API (no Trees indexer) | ~1000 entries/folder listing limit, ~1 MB inline files |
| No Markdown→HTML converter for WP/Ghost | Remote CMS bodies sent as-is; rendering depends on target |
| `s3-compatible` config validation only | No S3/R2 upload yet — documented, not hidden |
| File-first, no site rendering integration | No visual/inline editing on the deployed page |

## Roadmap

Near-term: deeper publisher capabilities (post list for Bitbucket/WP/Ghost),
Git Trees API for large repos, S3/R2 upload, durable sessions. Later:
self-host hardening for small teams. Possible commercial layer (hosted Cloud,
OAuth/teams) is explicitly future-only — see [roadmap.md](roadmap.md).

## Where to look in the code

- Schema and validation: `packages/core/src`
- A complete small adapter: `packages/adapter-hugo-markdown/src`
- Registry pattern: `packages/adapters/src`, `packages/publishers/src`
- API surface and auth middleware: `apps/studio/server`
- E2E approach: `apps/studio/e2e` + demo fixtures in `apps/studio/server/demo`
