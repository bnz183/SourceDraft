# Manual acceptance test

Run this checklist before promoting SourceDraft v0.1. Requires a configured `.env`, `sourcedraft.config.json`, and a test GitHub repository you can write to.

## Setup

- [ ] `pnpm install`
- [ ] Copy `sourcedraft.config.example.json` → `sourcedraft.config.json` and adjust paths
- [ ] Copy `.env.example` → `.env` with `CMS_ADMIN_PASSWORD`, `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`

## Start Studio

- [ ] `pnpm dev`
- [ ] Open `http://localhost:5173` (or the URL shown in the terminal)
- [ ] Log in with the admin password

## Navigation and settings

- [ ] **Posts** loads (post list or empty state)
- [ ] Open **Settings** and confirm adapter, `contentDir`, `mediaDir`, and `publicMediaPath` match your config

## Create and preview

- [ ] Open **Write** (new article)
- [ ] Fill title, description, category, tags, and body
- [ ] Upload an image (drag or **Choose image**)
- [ ] Set uploaded image as **Cover image**
- [ ] Insert uploaded image into the body
- [ ] Preview shows the expected output file content

## Publish new post

- [ ] Publish succeeds (no validation or API errors)
- [ ] New file appears in GitHub under `contentDir`
- [ ] Uploaded image appears in GitHub under `mediaDir`
- [ ] Cover and inline image paths in the committed file match `publicMediaPath`

## Edit existing post

- [ ] From **Posts**, open an existing post
- [ ] Edit title or body
- [ ] Publish update succeeds
- [ ] Same file path updates in GitHub (no duplicate slug file)

## Error smoke checks (optional)

- [ ] Wrong `GITHUB_OWNER` or `GITHUB_REPO` shows a clear error on publish or post list
- [ ] Missing or invalid token shows a clear error (not a blank screen)
- [ ] Upload over 5 MB or wrong file type is rejected with a clear message

## Automated checks (CI parity)

```bash
pnpm install --lockfile-only
pnpm build
pnpm test
```

All three commands should exit 0.
