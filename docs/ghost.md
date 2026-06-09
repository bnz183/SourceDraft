# Ghost publishing

SourceDraft can push posts to a **Ghost** site through the Admin API. This is a publishing connector only — SourceDraft does not host Ghost or replace Ghost Admin.

## Requirements

### Environment variables (`.env` only)

| Variable | Required | Purpose |
|----------|----------|---------|
| `GHOST_ADMIN_URL` | Yes | Site root URL, e.g. `https://example.com` (no `/ghost` suffix) |
| `GHOST_ADMIN_API_KEY` | Yes | Admin API key in `id:secret` format from Ghost Integrations |
| `GHOST_ACCEPT_VERSION` | No | Ghost API version header; default `v5.126` |
| `GHOST_DEFAULT_STATUS` | No | Status when `draft: false`; default `draft` |

Set `CMS_PUBLISHER=ghost` or `"publisher": "ghost"` in `sourcedraft.config.json`.

### Ghost site setup

1. Ghost 5.x (Admin API with JWT auth).
2. **Custom integration:** Settings → Integrations → Add custom integration.
3. Copy the **Admin API Key** (`{id}:{secret}`) into `GHOST_ADMIN_API_KEY`.

SourceDraft generates short-lived JWTs server-side (HS256, 5-minute expiry) — no `@tryghost/admin-api` dependency.

## How it works

1. Studio sends article JSON to `POST /api/publish`.
2. Server builds a JWT from `GHOST_ADMIN_API_KEY` and calls the Admin API.
3. **Create:** `POST /ghost/api/admin/posts/?source=html`
4. **Update:** `PUT /ghost/api/admin/posts/{id}/?source=html` when `remoteId` is provided.
5. Response includes `remoteId` (Ghost post uuid) for future updates.

### Payload mapping

| SourceDraft field | Ghost field |
|-------------------|-------------|
| `title` | `title` |
| `slug` | `slug` |
| `body` | `html` (`?source=html` — body should be HTML) |
| `description` | `excerpt` |
| `tags` | `tags: [{ name }]` |
| `draft: true` | `status: draft` |
| `draft: false` | `status: GHOST_DEFAULT_STATUS` |
| `heroImage` / `socialImage` (absolute URL) | `feature_image` |
| `metaTitle` / `title` | `meta_title` |
| `metaDescription` / `description` | `meta_description` |
| `canonicalUrl` | `canonical_url` |
| `coverImageAlt` | `feature_image_alt` |
| Absolute `socialImage` (when different from feature image) | `og_image` |

### HTML content

Ghost receives content with `?source=html`. SourceDraft sends `article.body` as HTML without conversion. For best results, write HTML in the editor or use a Markdown-to-HTML step in your own pipeline before publish.

## Limitations

- No post listing or editing from Ghost in Studio.
- No image upload to Ghost storage — only absolute URLs for `feature_image`.
- Updates require `remoteId` from a previous publish; otherwise each publish creates a new post.
- Lexical JSON is not generated; HTML source mode only.

## Security

- **Never** commit `GHOST_ADMIN_API_KEY` or expose it in browser code.
- Admin API keys have full content access — treat like a root password.
- Publish only from the server-side API on a trusted host.

## Common failures

| Symptom | Likely cause |
|---------|----------------|
| 401 / 403 | Invalid or revoked Admin API key |
| 404 | Wrong `GHOST_ADMIN_URL` |
| Invalid key format | Key must be `id:hexsecret` from Ghost Integrations |

See also: [publishers.md](publishers.md) · [configuration.md](configuration.md)
