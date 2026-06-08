# Manual acceptance test

Run this checklist before promoting SourceDraft v0.1. Use a **test** GitHub repository and local `.env` — never production secrets in issue reports.

## Automated checks (CI parity)

- [ ] `pnpm install`
- [ ] `pnpm build` — exit 0
- [ ] `pnpm test` — exit 0

```bash
pnpm install --lockfile-only
pnpm build
pnpm test
```

## Setup

- [ ] Copy `sourcedraft.config.example.json` → `sourcedraft.config.json` and adjust paths
- [ ] Copy `.env.example` → `.env` with `SOURCEDRAFT_ADMIN_PASSWORD`, `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`

## Start Studio

- [ ] `pnpm dev`
- [ ] Open `http://localhost:5173` (or the URL shown in the terminal)
- [ ] Log in with the admin password

## Navigation and settings

- [ ] After login, the **Posts** sidebar and center editor workspace load (not a blank page)
- [ ] Open **Settings** in the top bar and confirm adapter, `contentDir`, `mediaDir`, and `publicMediaPath` match your config
- [ ] Click **Back to editor** to return to the writing workspace

## Create and preview

- [ ] Click **New post** in the left sidebar
- [ ] Fill title and description in the center canvas; set category, tags, and dates in **Post details**
- [ ] Upload an image (drag or **Choose image**)
- [ ] Set uploaded image as **Cover image**
- [ ] Click **Insert into article** for an inline image
- [ ] Preview shows the expected output file content

## Publish new post

- [ ] **Publish to GitHub** succeeds (no validation or API errors)
- [ ] New file appears in GitHub under `contentDir`
- [ ] Uploaded image appears in GitHub under `mediaDir`
- [ ] Cover and inline image paths in the committed file match `publicMediaPath`

## Edit existing post

- [ ] From the left sidebar, open an existing post
- [ ] Edit title or body
- [ ] Publish update succeeds
- [ ] Same file path updates in GitHub (no duplicate slug file)

## Logout (optional)

- [ ] **Log out** returns to the sign-in screen
- [ ] Sign in again and confirm posts still load

## Error smoke checks (optional)

- [ ] Wrong `GITHUB_OWNER` or `GITHUB_REPO` shows a clear error on publish or post list
- [ ] Missing or invalid token shows a clear error (not a blank screen)
- [ ] Upload over 5 MB or wrong file type is rejected with a clear message
