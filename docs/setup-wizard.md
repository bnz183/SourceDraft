# Setup wizard

SourceDraft includes an interactive CLI wizard for first-time setup. It asks plain-language questions and writes `sourcedraft.config.json` and `.env` for you.

## Run the wizard

From the repository root:

```bash
pnpm setup
```

You will be asked about:

- **Adapter** — which site generator / output format (Astro MDX, Hugo, etc.)
- **Publisher** — GitHub, GitLab, Bitbucket, WordPress, or Ghost
- **Media provider** — git-backed uploads, Cloudinary, or S3-compatible (experimental)
- **Content and media directories** — folders in your repository
- **Default branch** — usually `main`
- **Categories** — comma-separated list for the editor
- **Deploy hook** — optional URL to rebuild your site after publish
- **Credentials** — tokens and URLs with short explanations (never shown in Studio)

### Existing files

- If `.env` already exists, the wizard creates `.env.backup.TIMESTAMP` before writing.
- Existing `.env` values are **not** overwritten unless you confirm each change.
- Secrets are **masked** in the summary output (typed input is still visible on screen).

### Connection checks

At the end, you can run optional **read-only** API checks:

- Git hosts: verify repository access
- WordPress / Ghost: verify REST / Admin API authentication
- Deploy hooks: URL shape only — the wizard does **not** trigger a build unless you explicitly opt in

## Validate configuration

Check your setup without opening Studio:

```bash
pnpm validate:config
```

Add live connection checks:

```bash
pnpm validate:config --connections
```

Validation reports:

- Unknown adapter, publisher, or media provider
- Missing required environment variables
- Invalid content or media path format
- Compatibility **warnings** (non-fatal) such as CMS publisher with git-backed media

Exit code `0` means no errors; warnings may still be printed.

## Studio status panel

In Studio → **Settings**, the **Compatibility & status** panel shows:

- Selected adapter, publisher, and media provider
- Validation status
- Missing env var names (not values)

Use the wizard or `validate:config` locally, then restart the API server if you change `.env`.

## Related docs

- [getting-started.md](getting-started.md)
- [configuration.md](configuration.md)
- [non-technical-overview.md](non-technical-overview.md)
