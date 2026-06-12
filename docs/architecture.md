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
    → Git repository file in contentDir, or remote CMS API (WordPress, Ghost)
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
    → media provider (git repo, Cloudinary) via publisher.uploadMedia or provider API
    → repository file in mediaDir, or CDN URL
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
| `@sourcedraft/adapter-*` | Platform-specific file output (Astro MDX, Markdown, Next.js MDX, Hugo, Eleventy/Jekyll, Docusaurus, MkDocs, Nuxt Content) |
| `@sourcedraft/adapters` | `adapterRegistry` — built-in adapter registration and dispatch |
| `@sourcedraft/github-publisher` | Low-level GitHub Contents API client |
| `@sourcedraft/publishers` | `publisherRegistry` — GitHub, GitLab, Bitbucket, WordPress, Ghost publish/upload/list/read |
| `@sourcedraft/media-providers` | Git media, Cloudinary, S3-compatible (config validation only) |
| `@sourcedraft/plugins` | Server-side loader for custom adapters/publishers/media providers |
| `@sourcedraft/setup` | Setup wizard and `validate:config` CLI |
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

**Adapters** turn a validated article into platform-specific file content. Registered in `adapterRegistry`. Eight ship today — see [adapters.md](adapters.md).

**Publishers** send content to a target. Registered in `publisherRegistry`. Shipped: `github`, `gitlab`, `bitbucket` (Git file commits) and `wordpress`, `ghost` (remote CMS APIs) — see [publishers.md](publishers.md) for the capability matrix.

Custom adapters, publishers, and media providers can register through server-side [plugins](plugins.md).
