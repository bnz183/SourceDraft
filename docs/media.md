# Media uploads

SourceDraft can upload hero and inline images to your GitHub repository through the publish API. Uploads are server-side only — the browser never sees your GitHub token.

See also: [Configuration](configuration.md) · [Security](security.md) · [Getting started](getting-started.md)

## Upload flow

1. In Studio, open **New Article** or edit an existing post.
2. Under **Hero image**, use the upload area: drag an image in or click **Choose image**.
3. The browser sends the file to `POST /api/media/upload` (multipart field name: `file`).
4. The server validates type, size, and file signature, sanitizes the filename, and commits the image to `mediaDir` via the GitHub Contents API.
5. On success, Studio shows the public path (for example `/images/my-photo-a1b2c3d4.png`).
6. Click **Use as hero image** to fill the hero field, or **Insert into body** to add a Markdown image line.

Your static site must serve files from the path your site expects — SourceDraft only writes into the repo.

## Supported file types

- PNG (`image/png`)
- JPEG (`image/jpeg`)
- GIF (`image/gif`)
- WebP (`image/webp`)

Other types are rejected before upload.

## Size limit

Maximum file size: **5 MB**. Larger files are rejected.

## `mediaDir` behavior

`mediaDir` in `sourcedraft.config.json` is the folder inside your **site repository** where uploaded images are committed.

Example:

```json
"mediaDir": "src/assets/images"
```

Uploaded files land at:

```
src/assets/images/your-file-abc12345.png
```

Override with `CMS_MEDIA_DIR` in `.env` if needed. See [configuration.md](configuration.md).

## Public path behavior

After upload, Studio returns a **public path** for use in frontmatter and Markdown — not the full repo path.

SourceDraft derives this from the last segment of `mediaDir`:

| `mediaDir` | Example upload | `publicPath` returned |
|------------|----------------|------------------------|
| `src/assets/images` | `photo-abc12345.png` | `/images/photo-abc12345.png` |
| `public/media` | `photo-abc12345.png` | `/media/photo-abc12345.png` |

Use that path in `heroImage` or in body Markdown such as `![Alt text](/images/photo-abc12345.png)`.

Your site’s build must map that URL to the file on disk (Astro and similar setups usually do this when assets live under `src/assets/` or `public/`).

## Security

- Upload requires the same Studio session as publish and post listing.
- The GitHub token is read only on the server when committing the file.
- Filenames are sanitized; content is checked against declared MIME type using file signatures.

**MVP password auth is intended for local/private use.** Do not expose Studio publicly without HTTPS, stronger auth, and deployment hardening.

Details: [security.md](security.md)
