# Architecture

SourceDraft is a small monorepo: typed packages for schema and publishing, plus a Studio app for editing.

## Data flow

```
Studio (browser)
    → article JSON
Publish API (server)
    → validate (@sourcedraft/core)
    → adapt (@sourcedraft/adapter-astro-mdx)
    → publish (@sourcedraft/github-publisher)
    → GitHub repository file
Your static site build (outside SourceDraft)
    → deployed site
```

## Packages

| Package | Role |
|---------|------|
| `@sourcedraft/core` | Article schema and validation |
| `@sourcedraft/adapter-astro-mdx` | Article → MDX file content |
| `@sourcedraft/github-publisher` | GitHub Contents API create/update |
| `@sourcedraft/config` | Load `sourcedraft.config.json` |

## Studio

- **Browser** — React editor, preview, login UI. No secrets in client code.
- **Server** — Express app: auth, config endpoint, publish endpoint.

`pnpm dev` in the repo root runs Studio UI and the publish API together.

## Configuration split

- **Commit-safe** — `sourcedraft.config.json` (paths, categories, adapter)
- **Secret** — `.env` (token, repo target, admin password)

See [configuration.md](configuration.md) and [github-publishing.md](github-publishing.md).

## Adapters and publishers

**Adapters** turn a validated article into platform-specific file content. Shipped: Astro MDX.

**Publishers** send that content to a target. Shipped: GitHub file commits.

Future adapters (not implemented here): Next.js MDX, Hugo, WordPress API, Ghost API.
