# Connector documentation screenshots

This folder is for **optional** reference screenshots of third-party API documentation pages (GitLab, Bitbucket, WordPress, Ghost, Cloudinary, Cloudflare R2, etc.).

## Current status

**No third-party screenshots are committed by default.** Official documentation is linked below. Maintainers may capture screenshots locally using the capture script only after confirming the source site’s terms of use, robots policy, and brand guidelines allow it.

Do **not** hotlink images from vendor sites in this repository.

## Official documentation links

| Connector | Official docs | Owner |
|-----------|---------------|-------|
| GitLab Repository Files API | https://docs.gitlab.com/ee/api/repository_files.html | GitLab Inc. |
| Bitbucket Cloud REST API (source) | https://developer.atlassian.com/cloud/bitbucket/rest/api-group-source/ | Atlassian |
| WordPress REST API (posts) | https://developer.wordpress.org/rest-api/reference/posts/ | WordPress Foundation |
| Ghost Admin API | https://docs.ghost.org/admin-api/ | Ghost Foundation |
| Cloudinary Upload API | https://cloudinary.com/documentation/image_upload_api_reference | Cloudinary Ltd. |
| Cloudflare R2 (S3-compatible) | https://developers.cloudflare.com/r2/ | Cloudflare, Inc. |

## Capturing screenshots (maintainers)

From the repository root:

```bash
# Review legal/brand constraints first, then:
pnpm capture-doc-screenshots -- --confirm-attribution
```

Output directory: `docs/assets/screenshots/connectors/`

When committing captures, update the table below.

## Attribution log

| File | Source URL | Capture date | Owner | Usage note |
|------|------------|--------------|-------|------------|
| *(none committed)* | — | — | — | Use official links above until captures are approved |

## Placeholders in docs

Until screenshots exist, connector docs link to the official URLs above. See [connectors/README.md](connectors/README.md).
