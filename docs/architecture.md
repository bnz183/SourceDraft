# Architecture

SourceDraft is a small monorepo: typed packages for schema, adapters, publishers, plus a Studio app for editing.

## Data flow

### Publish a post

```
Studio (browser)
    → article JSON (+ optional sourcePath when editing)
Publish API (server)
    → validate (@sourcedraft/core)
    → adapt (adapterRegistry / @sourcedraft/adapters)
    → publish (publisherRegistry / @sourcedraft/publishers)
    → GitHub repository file in contentDir
Your static site build (outside SourceDraft)
    → deployed site
```

### Upload media

```
Studio (browser)
    → multipart file to POST /api/media/upload
Publish API (server)
    → validate type, size, signature
    → sanitize filename
    → publisher.uploadMedia (github publisher today)
    → GitHub repository file in mediaDir
Studio
    → publicPath for heroImage / Markdown body
```

### List and load posts

```
Studio (browser)
    → GET /api/posts (or ?path= for one file)
Publish API (server)
    → publisher.listPosts / readPost
    → adapterRegistry.fromFrontmatter + validate (@sourcedraft/core)
    → JSON for Posts list and edit flow
```

## Packages

| Package | Role |
|---------|------|
| `@sourcedraft/core` | Article schema and validation |
| `@sourcedraft/adapter-*` | Platform-specific file output (Astro, Markdown, Next.js, Hugo, Eleventy/Jekyll) |
| `@sourcedraft/adapters` | `adapterRegistry` — built-in adapter registration and dispatch |
| `@sourcedraft/github-publisher` | Low-level GitHub Contents API client |
| `@sourcedraft/publishers` | `publisherRegistry` — typed publish/upload/list/read surface |
| `@sourcedraft/config` | Load `sourcedraft.config.json` |

## Studio

- **Browser** — React editor, post list, preview, media dropzone, login UI. No secrets in client code.
- **Server** — Express app: auth, config, posts, media upload, publish. Resolves adapter and publisher from config/env.

`pnpm dev` in the repo root runs Studio UI and the publish API together.

## Configuration split

- **Commit-safe** — `sourcedraft.config.json` (paths, categories, `adapter`, `publisher`, options)
- **Secret** — `.env` (token, repo target, admin password)

Env overrides: `CMS_ADAPTER`, `CMS_PUBLISHER`, `CMS_CONTENT_DIR`, `CMS_MEDIA_DIR`, `CMS_PUBLIC_MEDIA_PATH`.

See [configuration.md](configuration.md), [adapters.md](adapters.md), [compatibility-roadmap.md](compatibility-roadmap.md), [github-publishing.md](github-publishing.md), and [media.md](media.md).

## Adapters and publishers

**Adapters** turn a validated article into platform-specific file content. Registered in `adapterRegistry`.

**Publishers** send content to a target. Registered in `publisherRegistry`. Shipped: GitHub (`github`).

Future publishers (not implemented): WordPress API, Ghost API.
