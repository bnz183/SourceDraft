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
