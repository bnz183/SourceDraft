# Media uploads

SourceDraft can upload cover images, inline images, and PDF attachments through the publish API. Uploads are server-side only — credentials never reach the browser.

By default, files commit to your git publisher's `mediaDir` (`github-media` provider). Optionally use **Cloudinary** or an **S3-compatible** store instead.

Studio also includes a **media library** that lists files already committed under your configured `mediaDir` (git-backed providers only).

See also: [Configuration](configuration.md) · [Security](security.md) · [Getting started](getting-started.md)

## Upload flow

1. In Studio, click **New post** or open an existing post from the **Posts** sidebar.
2. Under **Cover image**, use the upload area: drag a file in or click **Choose file**.
3. The browser sends the file to `POST /api/media/upload` (multipart field name: `file`).
4. The server validates type, size, extension, and file signature, sanitizes the filename, and uploads via the configured **media provider**.
5. On success, Studio shows the public path or CDN URL (for example `/images/my-photo-a1b2c3d4.png` or a Cloudinary `https://res.cloudinary.com/...` URL).
6. Use **Use as cover image**, **Insert into article**, or **Insert PDF link** as appropriate, or pick the file later from the media library.

Your static site must serve files from the path your site expects — SourceDraft only writes into the repo.

## Media library

The **Media library** section (below the upload area in Post details) loads files from your configured `mediaDir` through `GET /api/media`.

For each file, Studio shows:

- Type: **Image** or **PDF**
- Filename and public path
- File size (from GitHub metadata when available)

Actions:

| Action | Images | PDFs |
|--------|--------|------|
| Copy path | Yes | Yes |
| Insert image Markdown | Yes | — |
| Use as cover | Yes | — |
| Insert link Markdown | — | Yes |

The library refreshes automatically after a successful upload. Use **Refresh** to reload manually.

Listing uses the same GitHub session as publish and post listing. Only allowed file types under `mediaDir` are returned; path traversal and disallowed extensions are rejected.

**Not included yet:** delete, folders, or tags.

## Media providers

Set `CMS_MEDIA_PROVIDER` in `.env` (default: `github-media`).

| Provider | Env vars | Notes |
|----------|----------|-------|
| `github-media` | Uses publisher credentials | Commits to `mediaDir` via git publisher; supports images + PDF |
| `cloudinary` | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, optional `CLOUDINARY_FOLDER` | Images only (PNG, JPEG, GIF, WebP); returns secure CDN URL |
| `s3-compatible` | `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, optional `S3_PUBLIC_BASE_URL`, `S3_FORCE_PATH_STYLE` | **Experimental** — config validation only; upload not implemented yet |

Upload API response includes `url`, `provider`, and optional `metadata` in addition to legacy `publicPath` / `repoPath` fields.

### Cloudinary transformations

Cloudinary supports on-the-fly transforms in delivery URLs (resize, crop, format, quality). SourceDraft uploads originals only — add transforms in your site templates or Cloudinary console. No transform builder in Studio yet.

### S3-compatible targets

The S3 provider is designed for Cloudflare R2, AWS S3, Backblaze B2, and similar endpoints through `S3_ENDPOINT` and path-style settings. Until upload is implemented, use `github-media` or `cloudinary`.

## Supported file types

### Images

- PNG (`image/png`)
- JPEG (`image/jpeg`)
- GIF (`image/gif`)
- WebP (`image/webp`)

Maximum image size: **5 MB**.

### Documents

- PDF (`application/pdf`) only for now

Maximum PDF size: **10 MB**.

## Rejected file types

The upload and library endpoints reject:

- SVG
- HTML
- Executables and scripts
- ZIP archives
- Any type outside the allowlists above

Validation uses declared MIME type, file extension, and basic file signature checks where practical.

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

The upload and media list APIs always use server config. The browser cannot send arbitrary `mediaDir` or `publicMediaPath` values.

## Fallback when `publicMediaPath` is omitted

If `publicMediaPath` is not set in `sourcedraft.config.json`, SourceDraft derives it from `mediaDir`:

| `mediaDir` | Derived `publicMediaPath` |
|------------|---------------------------|
| `public/images` | `/images` |
| `public/media/blog` | `/media/blog` |
| `src/assets/images` | `/images` |

If `mediaDir` starts with `public/`, the prefix is stripped. Otherwise the last path segment is used.

## Insertion behavior

- **Images** — Markdown image syntax: `![Alt text](/images/file.png)`
- **PDFs** — Markdown link syntax: `[Document label](/files/file.pdf)`

Studio inserts sensible defaults from the post title or filename. You can edit the Markdown after insertion.

## Public path examples

| `mediaDir` | `publicMediaPath` | Example upload | `publicPath` returned |
|------------|-------------------|----------------|------------------------|
| `public/images` | `/images` | `photo-abc12345.png` | `/images/photo-abc12345.png` |
| `src/assets/images` | `/images` | `photo-abc12345.png` | `/images/photo-abc12345.png` |
| `public/media` | `/media` | `guide-abc12345.pdf` | `/media/guide-abc12345.pdf` |

Use that path in `heroImage` or in body Markdown. Your site's build must map that URL to the file on disk.

## Security

- Upload and media listing require the same Studio session as publish and post listing.
- Media and publish credentials are read only on the server.
- Filenames are sanitized; content is checked against declared MIME type using file signatures.
- Path traversal (`..`, `.`) and files outside `mediaDir` are blocked.
- No SVG, HTML, executables, scripts, or ZIP uploads.

**MVP password auth is intended for local/private use.** Do not expose Studio publicly without HTTPS, stronger auth, and deployment hardening.

Details: [security.md](security.md)

## Limitations

- GitHub directory listings may truncate at very large folder sizes (same constraint as post listing).
- The library shows files already in the repo; it does not scan your entire repository outside `mediaDir`.
- Delete/rename from Studio is not supported in this release.
