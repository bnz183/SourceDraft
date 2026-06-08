# Architecture

SourceDraft is a small monorepo: typed packages for schema and publishing, plus a Studio app for editing.

## Data flow

### Publish a post

```
Studio (browser)
    → article JSON (+ optional sourcePath when editing)
Publish API (server)
    → validate (@sourcedraft/core)
    → adapt (@sourcedraft/adapter-astro-mdx or @sourcedraft/adapter-markdown)
    → publish (@sourcedraft/github-publisher)
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
    → publish (@sourcedraft/github-publisher, contentBase64)
    → GitHub repository file in mediaDir
Studio
    → publicPath for heroImage / Markdown body
```

### List and load posts

```
Studio (browser)
    → GET /api/posts (or ?path= for one file)
Publish API (server)
    → listFiles / readFile (@sourcedraft/github-publisher)
    → parse frontmatter, validate (@sourcedraft/core)
    → JSON for Overview and edit flow
```

## Packages

| Package | Role |
|---------|------|
| `@sourcedraft/core` | Article schema and validation |
| `@sourcedraft/adapter-astro-mdx` | Article → Astro MDX file content |
| `@sourcedraft/adapter-markdown` | Article → Markdown file content |
| `@sourcedraft/github-publisher` | GitHub Contents API (publish, list, read) |
| `@sourcedraft/config` | Load `sourcedraft.config.json` |

## Studio

- **Browser** — React editor, post list, preview, media dropzone, login UI. No secrets in client code.
- **Server** — Express app: auth, config, posts, media upload, publish.

`pnpm dev` in the repo root runs Studio UI and the publish API together.

## Configuration split

- **Commit-safe** — `sourcedraft.config.json` (paths, categories, adapter)
- **Secret** — `.env` (token, repo target, admin password)

See [configuration.md](configuration.md), [github-publishing.md](github-publishing.md), and [media.md](media.md).

## Adapters and publishers

**Adapters** turn a validated article into platform-specific file content. Shipped: Astro MDX and Markdown.

**Publishers** send content to a target. Shipped: GitHub file commits (text and binary via base64).

Future adapters (not implemented here): Next.js MDX, Hugo, WordPress API, Ghost API.
