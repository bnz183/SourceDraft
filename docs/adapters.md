# Adapters

An adapter turns a validated SourceDraft article into content for a specific platform — YAML (or TOML) frontmatter plus a Markdown or MDX body.

Adapter choice is set in `sourcedraft.config.json` (`adapter` field) or overridden with `CMS_ADAPTER` in `.env`. Built-in adapters register themselves in `@sourcedraft/adapters` through `adapterRegistry`.

```typescript
import { adapterRegistry } from "@sourcedraft/adapters";

adapterRegistry.render("astro-mdx", article, adapterOptions);
adapterRegistry.getPath("astro-mdx", article, { contentDir, adapterOptions });
```

Unknown adapter ids fail validation in `loadPublishEnv()` with a list of supported ids.

## Compatibility matrix

| Adapter key | Status | Extension | Default `contentDir` | Studio preview | SEO fields | Example |
|-------------|--------|-----------|----------------------|----------------|------------|---------|
| `astro-mdx` | Shipped | `.mdx` | `src/content/blog` | Yes | Yes | [astro-blog](../examples/astro-blog/) |
| `markdown` | Shipped | `.md` | `src/content/blog` | Yes | Yes | — |
| `nextjs-mdx` | Shipped | `.mdx` | `content/posts` | Yes | Yes | [nextjs-mdx-blog](../examples/nextjs-mdx-blog/) |
| `hugo-markdown` | Shipped | `.md` | `content/posts` | Yes | Yes | [hugo-blog](../examples/hugo-blog/) |
| `eleventy-jekyll-markdown` | Shipped | `.md` | `src/posts` / `_posts` | Yes | Yes | [eleventy-jekyll-blog](../examples/eleventy-jekyll-blog/) |
| `docusaurus-mdx` | Shipped | `.mdx` | `blog` | Yes | Yes | [docusaurus-blog](../examples/docusaurus-blog/) |
| `mkdocs-markdown` | Shipped | `.md` | `docs` | Yes (+ nav hint) | Yes (no `draft` in file) | [mkdocs-blog](../examples/mkdocs-blog/) |
| `nuxt-content-markdown` | Shipped | `.md` | `content/blog` | Yes | Yes | [nuxt-content-blog](../examples/nuxt-content-blog/) |

Custom adapters can register via [plugins.md](plugins.md). SEO fields: `metaTitle`, `metaDescription`, `canonicalUrl`, `socialImage`, `coverImageAlt`, `noindex`, computed `readingTime` — see [seo-fields.md](seo-fields.md).

Optional SEO fields (`metaTitle`, `metaDescription`, `canonicalUrl`, `socialImage`, `coverImageAlt`, `noindex`, `author`, computed `readingTime`) are emitted when present. Edit them in Studio under **SEO / Sharing**. See [seo-fields.md](seo-fields.md).

## Shared adapter options

Several adapters accept `filenameConvention` in `adapterOptions`:

| Value | Output path example |
|-------|---------------------|
| `slug` (default) | `contentDir/hello-world.md` |
| `date-slug` | `contentDir/2024-06-01-hello-world.md` |
| `index` | `contentDir/hello-world/index.md` |

Set `contentDir` in `sourcedraft.config.json` (or `CMS_CONTENT_DIR` in `.env`).

## Adapter-specific options

### `hugo-markdown`

| Option | Values | Default |
|--------|--------|---------|
| `frontmatterFormat` | `yaml`, `toml` | `yaml` |

### `eleventy-jekyll-markdown`

| Option | Values | Default |
|--------|--------|---------|
| `layout` | any non-empty string | `post` |
| `jekyllFilename` | `true`, `false` | `false` |
| `permalinkPrefix` | URL path prefix | `/` |
| `filenameConvention` | `slug`, `date-slug`, `index` | `slug` |

### `docusaurus-mdx`

| Option | Values | Default |
|--------|--------|---------|
| `filenameConvention` | `slug`, `date-slug`, `index` | `slug` |
| `hideTableOfContents` | `true`, `false` | `false` |

Emits `hide_table_of_contents: true` when enabled. Maps `author` → `authors` (YAML array), `heroImage` → `image`.

### `mkdocs-markdown`

| Option | Values | Default |
|--------|--------|---------|
| `filenameConvention` | `slug`, `date-slug`, `index` | `slug` |
| `navSection` | string | — |

Does not edit `mkdocs.yml`. Studio preview shows a **nav hint** with the path to wire into your nav manually.

### `nuxt-content-markdown`

| Option | Values | Default |
|--------|--------|---------|
| `filenameConvention` | `slug`, `date-slug`, `index` | `slug` |
| `navigation` | `true`, string label, or omit | article `title` |

## Field mapping summary

| Universal (SourceDraft) | astro-mdx / markdown | nextjs-mdx | hugo | eleventy-jekyll | docusaurus | mkdocs | nuxt-content |
|-------------------------|----------------------|------------|------|-----------------|------------|--------|--------------|
| `pubDate` | `pubDate` | `date` | `date` | `date` | — | `date` | `date` |
| `updatedDate` | `updatedDate` | `updatedDate` | `lastmod` | — | — | — | — |
| `category` | `category` | `category` | `categories[]` | `category` | — | — | `category` |
| `heroImage` | `heroImage` | `coverImage` | `images[]` | — | `image` | — | — |
| `author` | — | `author` | — | — | `authors[]` | — | — |
| `draft` | `draft` | `draft` | `draft` | `draft` | — | — | `draft` |

## Integration examples

| Site type | Example folder |
|-----------|----------------|
| Astro MDX | [examples/astro-blog](../examples/astro-blog/) |
| Next.js MDX | [examples/nextjs-mdx-blog](../examples/nextjs-mdx-blog/) |
| Hugo | [examples/hugo-blog](../examples/hugo-blog/) |
| Eleventy / Jekyll | [examples/eleventy-jekyll-blog](../examples/eleventy-jekyll-blog/) |
| Docusaurus | [examples/docusaurus-blog](../examples/docusaurus-blog/) |
| MkDocs | [examples/mkdocs-blog](../examples/mkdocs-blog/) |
| Nuxt Content | [examples/nuxt-content-blog](../examples/nuxt-content-blog/) |

## Remote CMS publishers (WordPress, Ghost)

Adapters still control **preview** and optional file-shaped output in Studio. When `publisher` is `wordpress` or `ghost`, the publish API sends article fields to the remote CMS — not necessarily a git commit. Use `markdown` or your site's file adapter for preview consistency.

Details: [publishers.md](publishers.md) · [wordpress.md](wordpress.md) · [ghost.md](ghost.md)
