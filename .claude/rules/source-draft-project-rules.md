# SourceDraft project rules

SourceDraft is an open-source publishing Studio for Markdown, MDX, and
Git-backed content workflows, with an adapter/publisher architecture for
multiple static-site frameworks and CMS targets. License: AGPL-3.0-or-later.

## Product identity

- Target users: solo developers, technical bloggers, documentation-site
  maintainers, Astro/Next.js/Hugo/Docusaurus/MkDocs/Nuxt Content users, and
  small teams that want Git-owned content.
- Core promise: Git-owned, portable content; secrets server-side; publishing
  confidence (validation, preview of exact output path/file, content QA).
- SourceDraft is **not** WordPress, not a site builder, not a hosted CMS.
- QuBrite.com is the origin story only. Never hardcode QuBrite (or any single
  site) into core logic, defaults, or fixtures.

## Engineering rules

- Universal article schema lives in `@sourcedraft/core`; adapters and
  publishers consume it through `adapterRegistry` / `publisherRegistry`.
- Secrets are read from `.env` in `apps/studio/server` only. Browser code must
  never import publisher/media packages or see credential values.
- Keep modules typed, small, and testable. Prefer boring reliable code.
- No unnecessary comments, no unrelated refactors, no dependency additions
  without explicit justification.
- Errors returned to Studio must be clear and actionable, without leaking
  secret values.

## Honesty rules

- Docs and UI describe only what is implemented. Shipped vs experimental vs
  not-shipped follows `docs/project-status.md` — update it when status
  changes, and keep README/CHANGELOG consistent with it.
- No fake analytics, fake charts, fake metrics, fake screenshots, placeholder
  features, or production/enterprise overclaims.
- Known limitations (MVP auth, in-memory sessions, Contents API scale limits,
  S3 upload not implemented) stay visibly documented until fixed.
