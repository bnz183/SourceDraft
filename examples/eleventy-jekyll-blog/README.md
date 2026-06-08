# Eleventy / Jekyll integration example (folder layout)

This is not a complete Eleventy or Jekyll site. It shows two common content layouts SourceDraft supports through `eleventy-jekyll-markdown`.

## Eleventy-style (`src/posts`)

[`sourcedraft.config.eleventy.json`](sourcedraft.config.eleventy.json) — slug-based filenames:

```
src/posts/getting-started-with-sourcedraft.md
```

## Jekyll-style (`_posts`)

[`sourcedraft.config.jekyll.json`](sourcedraft.config.jekyll.json) — date-prefixed filenames:

```
_posts/2024-06-01-getting-started-with-sourcedraft.md
```

Enable Jekyll filenames with:

```json
"adapterOptions": {
  "layout": "post",
  "jekyllFilename": true
}
```

Set `layout` to match your site's layout name. Permalink defaults to `/<slug>/`; override with `permalinkPrefix` if needed.

## Sample output

See [`src/posts/getting-started-with-sourcedraft.md`](src/posts/getting-started-with-sourcedraft.md).

## How to publish

1. Choose Eleventy (`src/posts`) or Jekyll (`_posts`) config from this folder’s example JSON files.
2. Copy `adapter`, `contentDir`, and `adapterOptions` into SourceDraft’s `sourcedraft.config.json`.
3. For Bitbucket: set `publisher`: `bitbucket` and `BITBUCKET_*` in `.env` (publish works; post list in Studio is not available yet).
4. Publish from Studio → confirm filename (`slug` or `YYYY-MM-DD-slug` for Jekyll).
5. Run Eleventy/Jekyll build as usual.

Bitbucket recipe: [docs/quickstart-recipes.md](../../docs/quickstart-recipes.md#eleventy--bitbucket)
