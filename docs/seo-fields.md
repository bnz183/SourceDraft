# SEO and sharing fields

SourceDraft stores optional SEO metadata in article frontmatter (git publishers) or maps it to CMS APIs (Ghost, WordPress). Fields are **optional** — old posts without them keep working.

## Schema fields

| Field | Type | Notes |
|-------|------|--------|
| `metaTitle` | string | Falls back to `title` when empty |
| `metaDescription` | string | Falls back to `description` when empty |
| `canonicalUrl` | string | Must be a valid `http(s)` URL if set |
| `socialImage` | string | Falls back to cover/`heroImage` when empty |
| `coverImageAlt` | string | Alt text for the cover image |
| `noindex` | boolean | Default `false`; emitted in frontmatter only when `true` |
| `author` | string | Optional byline |
| `updatedDate` | date | Optional last-updated date |
| `readingTime` | number | **Computed** from body word count on publish (not required in the editor) |

Cover image path remains `heroImage` in most adapters (Next.js uses `coverImage` in frontmatter).

## Studio

Open **SEO / Sharing** in the post details sidebar (collapsed by default).

- Soft warnings for long meta title/description, missing cover alt when a cover is set
- Warnings do **not** block publishing
- Invalid canonical URLs block publish (schema validation)

## Git publishers

All built-in adapters emit SEO fields in frontmatter when present. Your static site template decides how to render them (for example `<meta name="robots">`, Open Graph tags).

## Ghost

Mapped on publish:

| SourceDraft | Ghost |
|-------------|-------|
| `metaTitle` / `title` | `meta_title` |
| `metaDescription` / `description` | `meta_description` |
| `canonicalUrl` | `canonical_url` |
| `socialImage` / `heroImage` | `feature_image` |
| `coverImageAlt` | `feature_image_alt` |
| Absolute `socialImage` (when different) | `og_image` |

## WordPress

Core REST fields always sent: `title`, `content`, `excerpt`, `slug`, `status`, taxonomies.

SEO plugin meta (Yoast, Rank Math, etc.) is **not** sent unless you map keys in `publisherOptions`:

```json
{
  "publisher": "wordpress",
  "publisherOptions": {
    "wordpressSeoMeta": {
      "_yoast_wpseo_title": "metaTitle",
      "_yoast_wpseo_metadesc": "metaDescription",
      "rank_math_title": "metaTitle"
    }
  }
}
```

WordPress must expose those meta keys to the REST API (often requires plugin configuration). SourceDraft does not assume any SEO plugin is installed.

## Related docs

- [adapters.md](adapters.md)
- [publishers.md](publishers.md)
- [wordpress.md](wordpress.md)
- [ghost.md](ghost.md)
