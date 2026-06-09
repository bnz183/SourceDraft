# Compatibility roadmap

Extension foundation for SourceDraft adapters and publishers.

## Registry architecture (shipped)

| Registry | Package | Responsibility |
|----------|---------|----------------|
| `adapterRegistry` | `@sourcedraft/adapters` | Article → file content, paths, frontmatter parsing |
| `publisherRegistry` | `@sourcedraft/publishers` | Publish articles, upload media, list/read posts |

Built-in connectors register on package load via `registerBuiltInAdapters()` and `registerBuiltInPublishers()`. Custom adapters, publishers, and media providers can register via server-side plugins — see [plugins.md](plugins.md).

### Adapter interface

Each adapter implements:

- `render(article, adapterOptions?)` — file body
- `getPath(article, { contentDir, adapterOptions? })` — target repo path
- `fromFrontmatter(...)` — load existing posts back into the universal schema
- `previewMeta` — Studio preview label and extension

### Publisher interface

Each publisher implements:

- `publishArticle({ path, content, message })`
- `uploadMedia({ repoPath, contentBase64, message })` when supported
- `listPosts({ contentDir })` and `readPost({ path })` for GitHub-backed listing

Publishers declare `capabilities`. Unsupported methods return `{ ok: false, error: "..." }` with a clear message.

## Configuration

| Setting | File | Override env |
|---------|------|--------------|
| `adapter` | `sourcedraft.config.json` | `CMS_ADAPTER` |
| `publisher` | `sourcedraft.config.json` | `CMS_PUBLISHER` |
| `adapterOptions` | `sourcedraft.config.json` | — |
| `publisherOptions` | `sourcedraft.config.json` | — |
| GitHub token, owner, repo | `.env` | — |

Defaults: `adapter: "astro-mdx"`, `publisher: "github"`.

## Shipped connectors

**Adapters:** `astro-mdx`, `markdown`, `nextjs-mdx`, `hugo-markdown`, `eleventy-jekyll-markdown`, `docusaurus-mdx`, `mkdocs-markdown`, `nuxt-content-markdown`

**Publishers:** `github` (wraps `@sourcedraft/github-publisher`)

## Studio integration points

| Area | Uses |
|------|------|
| Preview | `adapterRegistry.render`, `getPath`, `previewMeta` |
| Publish | `adapterRegistry` + `publisherRegistry.create(...).publishArticle` |
| Media upload | `publisher.uploadMedia` |
| Post list/load | `publisher.listPosts`, `readPost` + `adapterRegistry.fromFrontmatter` |
| Setup health | Validates adapter and publisher ids |

## Future (not implemented)

- WordPress REST API publisher
- Ghost API publisher
- Plugin/marketplace loading
- Git Trees API for large repos

## Risks

- Post list still walks GitHub Contents API — large repos remain an MVP limitation.
- `listPosts` is reused for media library listing until a dedicated `listMedia` capability is added.
- SEO optional fields are available in schema, adapters, and Studio **SEO / Sharing** panel — see [seo-fields.md](seo-fields.md).
