# Project status

SourceDraft is an early MVP aimed at real single-editor publishing workflows. It is usable, but not feature-complete.

## What works today

- Studio editor for universal article fields
- Schema validation via `@sourcedraft/core`
- Live Astro MDX preview via `@sourcedraft/adapter-astro-mdx`
- GitHub file publish (create or update) via `@sourcedraft/github-publisher`
- Project config file (`sourcedraft.config.json`) plus `.env` secrets
- Local password protection for Studio and API routes

## MVP limitations

| Area | Current state |
|------|----------------|
| Authentication | Single shared password (`SOURCEDRAFT_ADMIN_PASSWORD`) |
| Users | No accounts, roles, or OAuth |
| Media | Hero image is a path string only; no upload UI |
| Article list | Dashboard does not sync from GitHub yet |
| Adapters | `astro-mdx` only |
| Publishers | GitHub file API only |
| Sessions | In-memory; expire on API restart |
| Hosting | Local/dev-oriented; no managed cloud product |

## Architecture (unchanged direction)

```
Studio UI → article schema → validation → adapter → publisher
```

Future adapters (not shipped): Next.js MDX, Hugo, WordPress API, Ghost API.

## What “ready to share” means here

The project is ready to share as an open-source tool for developers and technical bloggers who accept MVP limits. It is not positioned as a turnkey hosted CMS for non-technical teams without a setup step.

## Origin

SourceDraft started as an internal publishing tool for [QuBrite.com](https://qubrite.com). The core packages stay generic; site-specific paths and categories live in config, not in code.
