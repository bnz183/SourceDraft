# WordPress publishing

SourceDraft can push posts to a **self-hosted or managed WordPress** site through the REST API. This is a publishing connector only — SourceDraft does not host WordPress or replace the wp-admin dashboard.

## Requirements

### Environment variables (`.env` only)

| Variable | Required | Purpose |
|----------|----------|---------|
| `WORDPRESS_API_URL` | Yes | REST base URL, e.g. `https://example.com/wp-json` |
| `WORDPRESS_USERNAME` | Yes | WordPress user that owns the application password |
| `WORDPRESS_APP_PASSWORD` | Yes | Application password (spaces are fine) |
| `WORDPRESS_DEFAULT_STATUS` | No | Status when `draft: false` in article; default `draft` |
| `WORDPRESS_DEFAULT_AUTHOR` | No | Numeric WordPress user id for `author` field |

Set `CMS_PUBLISHER=wordpress` or `"publisher": "wordpress"` in `sourcedraft.config.json`.

### WordPress site setup

1. WordPress 5.6+ with REST API enabled (default on most sites).
2. **Application password** for the publishing user:
   - Users → Profile → Application Passwords → Add New
   - Copy the generated password into `WORDPRESS_APP_PASSWORD` in `.env`
3. User needs **`edit_posts`** (Author or Editor role minimum).

Permalinks must not block `/wp-json/` (pretty permalinks recommended).

## How it works

1. Studio sends article JSON to `POST /api/publish` (session cookie required).
2. Server validates the article and calls the WordPress publisher.
3. **Create:** `POST /wp/v2/posts` when no `remoteId` is sent.
4. **Update:** `POST /wp/v2/posts/{id}` when `remoteId` is the WordPress post id.
5. Response includes `remoteId` — store it client-side for future updates.

### Payload mapping

| SourceDraft field | WordPress field |
|-------------------|-----------------|
| `title` | `title` |
| `body` | `content` (sent as-is; Markdown depends on plugins) |
| `slug` | `slug` |
| `description` | `excerpt` |
| `pubDate` | `date` |
| `draft: true` | `status: draft` |
| `draft: false` | `status: WORDPRESS_DEFAULT_STATUS` (default `draft`) |
| `category` | `categories[]` when mapped (see below) |
| `tags` | `tags[]` when mapped (see below) |

### Categories and tags

SourceDraft does **not** auto-create WordPress terms. Map Studio category/tag names to numeric ids in `publisherOptions`:

```json
{
  "publisher": "wordpress",
  "publisherOptions": {
    "wordpressCategoryIds": {
      "Guides": 3,
      "Tutorials": 5
    },
    "wordpressTagIds": {
      "astro": 10,
      "cms": 12
    }
  }
}
```

Unmapped names are omitted from the API payload.

### SEO plugin meta (optional)

Core REST fields do not include Yoast, Rank Math, or similar SEO plugin keys by default. To send plugin meta, map keys in `publisherOptions.wordpressSeoMeta`:

```json
"wordpressSeoMeta": {
  "_yoast_wpseo_title": "metaTitle",
  "_yoast_wpseo_metadesc": "metaDescription"
}
```

Those keys must be registered for REST access in WordPress. Without this mapping, SourceDraft only sends title, content, excerpt, slug, and status. See [seo-fields.md](seo-fields.md).

### Featured images

`featured_media` is not set automatically. WordPress expects a media attachment id, not a URL. Upload media in WordPress or extend your workflow separately.

## Limitations

- No post listing or editing from WordPress in Studio (use a Git publisher for the Posts sidebar).
- No media upload through SourceDraft for WordPress.
- Updates require a stored `remoteId` from a previous publish.
- Markdown in `body` is not converted to HTML unless you add that in your stack.

## Security

- Never commit `WORDPRESS_APP_PASSWORD` or put it in `sourcedraft.config.json`.
- The browser never receives WordPress credentials.
- Run Studio on a trusted network; use HTTPS if exposed beyond localhost.

## Common failures

| Symptom | Likely cause |
|---------|----------------|
| 401 Unauthorized | Wrong username or application password |
| 403 Forbidden | User lacks `edit_posts` permission |
| 404 on API URL | Wrong `WORDPRESS_API_URL` or permalinks blocking REST |
| 404 on update | Invalid `remoteId` |

See also: [publishers.md](publishers.md) · [configuration.md](configuration.md)
