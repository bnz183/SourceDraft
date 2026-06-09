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

| Adapter key | Extension | Default `contentDir` | Best use case | Supported SEO fields |
|-------------|-----------|-------------------|---------------|----------------------|
| `astro-mdx` | `.mdx` | `src/content/blog` | Astro content collections | `metaTitle`, `metaDescription`, `canonicalUrl`, `socialImage` (when set on article) |
| `markdown` | `.md` | `src/content/blog` | Generic Markdown repos | same |
| `nextjs-mdx` | `.mdx` | `content/posts` | Next.js MDX blogs | same + `author` → `author`, `heroImage` → `coverImage` |
| `hugo-markdown` | `.md` | `content/posts` | Hugo static sites | same |
| `eleventy-jekyll-markdown` | `.md` | `src/posts` / `_posts` | Eleventy or Jekyll | same |
| `docusaurus-mdx` | `.mdx` | `blog` | Docusaurus blog plugin | same + `author` → `authors[]`, `heroImage` → `image` |
| `mkdocs-markdown` | `.md` | `docs` | MkDocs documentation sites | same (no `draft` in output) |
| `nuxt-content-markdown` | `.md` | `content/blog` | Nuxt Content v2 collections | same |

SEO fields are optional on the universal article schema and emitted when present. Studio UI for editing them is still limited — see [seo-fields-roadmap.md](seo-fields-roadmap.md).

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

## Future (not in repo yet)

- WordPress REST API
- Ghost API

These are planned directions, not shipped packages.
