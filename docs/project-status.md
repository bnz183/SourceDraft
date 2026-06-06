# Project status

Early MVP — usable for single-editor publishing to GitHub, not feature-complete.

## What works

- Studio editor with universal article fields
- Validation (`@sourcedraft/core`)
- Live Astro MDX preview (`@sourcedraft/adapter-astro-mdx`)
- GitHub file create/update (`@sourcedraft/github-publisher`)
- `sourcedraft.config.json` + `.env` configuration
- Server-side password auth for Studio and API

## What does not work yet

| Area | Today |
|------|--------|
| Auth | One shared password; no OAuth or accounts |
| Media | Hero image path only; no upload |
| Article list | Overview does not load posts from GitHub |
| Adapters | `astro-mdx` only |
| Publishers | GitHub Contents API only |
| Sessions | In-memory; lost when API restarts |
| Hosting | You run it locally or on your own server |

## Intended use

Open-source tool for developers and technical bloggers who accept these limits. Not a turnkey hosted CMS for teams without a setup step.

## Origin

Built first for [QuBrite.com](https://qubrite.com). Core code stays generic; each site uses its own config and GitHub target.

Publishing flow: [github-publishing.md](github-publishing.md)
