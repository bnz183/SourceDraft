# Changelog

All notable changes to SourceDraft are documented here. The project uses [Semantic Versioning](https://semver.org/) where practical.

## Unreleased

### Changed

- **Studio design-system foundation (Phase 4a)** — added an 8px spacing scale,
  a radius/elevation scale, and a regularized modular type scale as CSS tokens.
- **Tokenized color palette in light and dark**, tuned for WCAG 2.2 AA. Dark
  follows the OS by default and is overridable by an explicit light/dark/system
  choice persisted across reloads (new app-bar theme toggle).
- **App shell** — sticky top bar, a persistent left navigation rail for Posts
  and Settings, a consistent button system, and the Publish action as a large,
  anchored, high-contrast primary button. Reduced visual noise via tokens.
- Added `.claude/rules/ui-standards.md` as the authoritative Studio UI bar.
- **Editor link/image/file insertion (Phase 4b)** — replaced the blocking
  `window.prompt` link, image, and file-link flows (toolbar and slash commands)
  with an accessible in-Studio dialog (labelled fields, Enter to submit, Escape
  to cancel, bare-domain URLs gain `https://`). Removed the unused legacy
  `MarkdownToolbar`.
- **Onboarding / settings staging (Phase 4c)** — Settings now opens with a clear
  title and is staged into steps that surface publishing readiness as the
  obvious first action, with advanced configuration behind progressive
  disclosure. Tokenized the onboarding/settings surfaces (spacing, radius, and
  off-scale font sizes) onto the design system.
- **Final UX QA (Phase 4d)** — regenerated the Studio screenshots in
  `docs/assets/` for the refreshed UI (and repaired the screenshot script's
  stale selectors), and updated `docs/project-status.md` to reflect the shipped
  Studio UI (themes, navigation rail, inline insert dialogs, staged settings).

## v0.1.0

First public open-source MVP for local/private Git-backed publishing.

### Added

- **Studio editor** for Markdown and MDX posts with universal article fields (title, slug, dates, category, tags, draft, body)
- **Markdown and MDX publishing** via adapters (`astro-mdx`, `markdown`)
- **GitHub publishing** through the Contents API (`@sourcedraft/github-publisher`)
- **Existing post listing and editing** from configured `contentDir`
- **Image uploads** to `mediaDir` (PNG, JPEG, GIF, WebP; 5 MB max)
- **Configurable `publicMediaPath`** — separate repo write path from URL path inserted into posts
- **Universal article validation** (`@sourcedraft/core`)
- **Project configuration** via `sourcedraft.config.json` and `.env` overrides
- **CI baseline** — build and unit tests on push/PR

### Security (MVP)

- Local/private **password auth** with server-side session cookies
- GitHub token and admin password stay on the server only
- Lightweight same-site protection on state-changing API routes

**Warning:** MVP password auth is intended for local or private use. Do not expose Studio publicly without HTTPS, stronger auth, and deployment hardening.

### Known limitations

- GitHub Contents API only (no Git Trees API or content indexer yet)
- In-memory sessions (lost when the API restarts)
- No OAuth, user accounts, or hosted multi-tenant product
- Large content folders may hit GitHub listing or file-size limits

See [docs/project-status.md](docs/project-status.md) for current scope.
