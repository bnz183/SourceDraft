# QuBrite integration example

[QuBrite.com](https://qubrite.com) was the first site published with SourceDraft. It uses the same generic config any Astro MDX project would use:

- `sourcedraft.config.json` for content paths and categories
- `.env` for `GITHUB_OWNER`, `GITHUB_REPO`, and `GITHUB_TOKEN`

No QuBrite-specific logic belongs in the core packages. Site-specific values stay in config files.
