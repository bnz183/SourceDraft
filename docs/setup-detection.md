# Setup detection

Settings → **Project onboarding** scans local project files and suggests configuration for SourceDraft.

## What it detects

Framework markers for:

- Astro MDX
- Next.js MDX
- Hugo
- Eleventy / Jekyll
- Docusaurus
- MkDocs
- Nuxt Content

For each match it suggests:

- **Adapter** — e.g. `astro-mdx`, `hugo-markdown`
- **Content root** — scans for folders with `.md`/`.mdx` posts (e.g. `src/content/blog`, `content/posts`)
- **Media paths** — `mediaDir` and `publicMediaPath`
- **Default branch** — from `.git/HEAD` when present
- **Frontmatter hints** — reads a few sample posts and lists common fields (with mapping to Studio’s universal schema)
- **Categories** — inferred from existing post frontmatter when available

Plain-language copy in Studio summarizes what was found, for example: “We found a Hugo project… Posts live in `content/posts`… We recommend the Hugo Markdown adapter.”

## API

`GET /api/setup/detect` (authenticated) scans:

1. `SOURCEDRAFT_REPO_ROOT` or `CMS_REPO_ROOT` if set
2. Otherwise walks up from the API working directory looking for `package.json`, `sourcedraft.config.json`, or common framework config files

Scans ignore `node_modules`, `.git`, `dist`, and other common build/cache folders.

`POST /api/setup/generate-config` (authenticated) writes `sourcedraft.config.json` **only when the file does not exist**, using the primary detection result. The response includes a summary of fields written.

## Applying suggestions

1. **Generate config** — one-click write of `sourcedraft.config.json` when missing (review the preview summary first).
2. **Copy suggested config** — copies JSON to the clipboard when confidence is high and there are no warnings.
3. **`pnpm setup`** — interactive CLI wizard pre-fills adapter, content folder, branch, and categories from detection when possible ([setup-wizard.md](setup-wizard.md)).

If detection fails (unknown framework, no posts found), Studio explains how to proceed manually.

Existing `sourcedraft.config.json` files are never overwritten by Generate config.

## Content audit

Settings → **Content audit** runs a separate read-only scan of existing posts via `GET /api/content/audit`. See [content-qa.md](content-qa.md#content-audit-existing-posts).
