# Setup detection

Settings → **Setup detection** scans local project files and suggests configuration for SourceDraft. It does **not** write `sourcedraft.config.json` automatically.

## What it detects

Framework markers for:

- Astro MDX
- Next.js MDX
- Hugo
- Eleventy / Jekyll
- Docusaurus
- MkDocs
- Nuxt Content

For each match it suggests `adapter`, `contentDir`, `mediaDir`, `publicMediaPath`, and `defaultBranch`, plus a **confidence score** and explanation of signals found.

## API

`GET /api/setup/detect` (authenticated) scans:

1. `SOURCEDRAFT_REPO_ROOT` or `CMS_REPO_ROOT` if set
2. Otherwise walks up from the API working directory looking for `package.json`, `sourcedraft.config.json`, or common framework config files

## Applying suggestions

When confidence is high and there are no warnings, **Copy suggested config** copies a JSON snippet to the clipboard. Review paths, then paste into `sourcedraft.config.json` and run `pnpm validate:config`.

For interactive setup, use `pnpm setup` ([setup-wizard.md](setup-wizard.md)).

## Content audit

Settings → **Content audit** runs a separate read-only scan of existing posts via `GET /api/content/audit`. See [content-qa.md](content-qa.md#content-audit-existing-posts).
