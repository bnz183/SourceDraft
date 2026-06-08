# Media uploads

SourceDraft can upload cover and inline images to your GitHub repository through the publish API. Uploads are server-side only — the browser never sees your GitHub token.

See also: [Configuration](configuration.md) · [Security](security.md) · [Getting started](getting-started.md)

## Upload flow

1. In Studio, open **Write** or edit an existing post from **Posts**.
2. Under **Cover image**, use the upload area: drag an image in or click **Choose image**.
3. The browser sends the file to `POST /api/media/upload` (multipart field name: `file`).
4. The server validates type, size, and file signature, sanitizes the filename, and commits the image to `mediaDir` via the GitHub Contents API.
5. On success, Studio shows the public path (for example `/images/my-photo-a1b2c3d4.png`).
6. Click **Use as cover image** to fill the cover field (`heroImage` in frontmatter), or **Insert into body** to add a Markdown image line.

Your static site must serve files from the path your site expects — SourceDraft only writes into the repo.

## Supported file types

- PNG (`image/png`)
- JPEG (`image/jpeg`)
- GIF (`image/gif`)
- WebP (`image/webp`)

Other types are rejected before upload.

## Size limit

Maximum file size: **5 MB**. Larger files are rejected.

## `mediaDir` vs `publicMediaPath`

These settings are separate on purpose:

| Setting | Purpose |
|---------|---------|
| **`mediaDir`** | Repository path where uploaded files are committed |
| **`publicMediaPath`** | Site-relative URL path inserted into `heroImage` and body Markdown |

Example:

```json
{
  "mediaDir": "public/images",
  "publicMediaPath": "/images"
}
```

Uploaded files land at:

```
public/images/your-file-abc12345.png
```

Studio returns `/images/your-file-abc12345.png` for frontmatter and Markdown — not the full repo path.

Override `mediaDir` with `CMS_MEDIA_DIR` and `publicMediaPath` with `CMS_PUBLIC_MEDIA_PATH` in `.env` if needed. See [configuration.md](configuration.md).

The upload API always uses server config. The browser cannot send arbitrary `mediaDir` or `publicMediaPath` values.

## Fallback when `publicMediaPath` is omitted

If `publicMediaPath` is not set in `sourcedraft.config.json`, SourceDraft derives it from `mediaDir`:

| `mediaDir` | Derived `publicMediaPath` |
|------------|---------------------------|
| `public/images` | `/images` |
| `public/media/blog` | `/media/blog` |
| `src/assets/images` | `/images` |

If `mediaDir` starts with `public/`, the prefix is stripped. Otherwise the last path segment is used.

## Public path examples

| `mediaDir` | `publicMediaPath` | Example upload | `publicPath` returned |
|------------|-------------------|----------------|------------------------|
| `public/images` | `/images` | `photo-abc12345.png` | `/images/photo-abc12345.png` |
| `src/assets/images` | `/images` | `photo-abc12345.png` | `/images/photo-abc12345.png` |
| `public/media` | `/media` | `photo-abc12345.png` | `/media/photo-abc12345.png` |

Use that path in `heroImage` or in body Markdown such as `![Alt text](/images/photo-abc12345.png)`.

Your site’s build must map that URL to the file on disk (Astro and similar setups usually do this when assets live under `src/assets/` or `public/`).

## Security

- Upload requires the same Studio session as publish and post listing.
- The GitHub token is read only on the server when committing the file.
- Filenames are sanitized; content is checked against declared MIME type using file signatures.

**MVP password auth is intended for local/private use.** Do not expose Studio publicly without HTTPS, stronger auth, and deployment hardening.

Details: [security.md](security.md)
