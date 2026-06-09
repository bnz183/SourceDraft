# docs/assets

Static images for SourceDraft documentation (primarily README screenshots).

## Naming

Use lowercase kebab-case PNG files:

- `studio-overview.png`
- `editor.png`
- `toolbar.png`
- `autosave.png`
- `media-library.png`
- `content-quality.png`
- `preview.png`
- `publish-success.png`
- `setup-health.png`

Regenerate with `pnpm screenshots:generate` from the repository root (demo mode, no GitHub credentials).

Add new screenshots only when they reflect the current Studio UI.

## Privacy and security

Before committing an image, confirm it does **not** show:

- GitHub tokens or personal access tokens
- `.env` contents or `SOURCEDRAFT_ADMIN_PASSWORD`
- Private repository names you do not want public (use a test repo or blur)
- Personal email addresses, internal URLs, or unrelated proprietary content

Automated screenshots use demo mode fixtures only. Manual GitHub-mode captures should use a dedicated test repository.

## Usage

Reference images from the root README or docs with relative paths, for example:

```markdown
![Studio overview](docs/assets/studio-overview.png)
```

See [screenshots.md](../screenshots.md) for capture and regeneration instructions.
