# docs/assets

Static images for SourceDraft documentation (primarily README screenshots).

## Naming

Use lowercase kebab-case PNG files:

- `studio-overview.png`
- `editor-preview.png`
- `media-upload.png`
- `publish-success.png`

Add new screenshots only when they reflect the current Studio UI.

## Privacy and security

Before committing an image, confirm it does **not** show:

- GitHub tokens or personal access tokens
- `.env` contents or `SOURCEDRAFT_ADMIN_PASSWORD`
- Private repository names you do not want public (use a test repo or blur)
- Personal email addresses, internal URLs, or unrelated proprietary content

Studio Settings fields are read-only, but screenshots can still expose owner/repo names and folder paths. Use a dedicated test GitHub repository when possible.

## Usage

Reference images from the root README or docs with relative paths, for example:

```markdown
![Studio overview](docs/assets/studio-overview.png)
```

See [screenshots.md](../screenshots.md) for capture instructions.
