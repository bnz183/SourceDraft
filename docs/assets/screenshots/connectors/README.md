# Connector screenshot placeholders

Screenshots of third-party API documentation are **not committed** by default.

## Why placeholders?

Official vendor documentation is copyrighted. SourceDraft docs link to authoritative URLs instead of hotlinking or embedding unlicensed captures.

## Adding screenshots

1. Read [../ATTRIBUTION.md](../ATTRIBUTION.md) and confirm the source site allows capture and redistribution in an open-source repo.
2. Run `pnpm capture-doc-screenshots -- --confirm-attribution` from the repo root (requires Playwright; see script help).
3. Record each file in the attribution log with URL, date, and owner.
4. Prefer cropped, readable regions — avoid logos unless brand guidelines permit.

## Expected filenames (when captured)

| Filename | Subject |
|----------|---------|
| `gitlab-repository-files-api.png` | GitLab Repository Files API overview |
| `bitbucket-source-api.png` | Bitbucket commit-upload / source API |
| `wordpress-rest-posts.png` | WordPress REST posts endpoint |
| `ghost-admin-api.png` | Ghost Admin API authentication |
| `cloudinary-upload-api.png` | Cloudinary upload API reference |
| `cloudflare-r2-s3.png` | Cloudflare R2 S3-compatible overview |

Until then, use the official links in [../ATTRIBUTION.md](../ATTRIBUTION.md).
