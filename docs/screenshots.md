# Screenshots

Screenshots help first-time visitors understand SourceDraft without running the project locally. They are optional for development but useful for the README and release notes.

## Required screenshots checklist

Capture these from a **real local session** (demo mode or a sanitized test repo). Save PNGs under `docs/assets/` when ready.

| File | What to show | Mode |
|------|----------------|------|
| `studio-overview.png` | **Posts** sidebar with list or empty state; app bar visible | Demo or GitHub |
| `editor.png` | Center writing canvas with title, description, and body | Demo or GitHub |
| `toolbar.png` | Markdown toolbar above the body field | Demo or GitHub |
| `autosave.png` | Document status in the app bar (e.g. “Unsaved changes” or “Saved locally”) | Demo or GitHub |
| `media-library.png` | Media library section in **Post details** | Demo or GitHub |
| `content-quality.png` | Content quality panel with word count / warnings | Demo or GitHub |
| `preview.png` | MDX/Markdown preview panel with output path | Demo or GitHub |
| `publish-success.png` | Publish confirmation (GitHub or **Publish simulated** in demo) | Demo or GitHub |
| `setup-health.png` | Settings → **Setup health** with check rows | Demo or GitHub |

Do not commit placeholder or generated fake screenshots.

## How to capture locally

### GitHub mode

1. Configure `.env` with a **test repository** (not production secrets).
2. Start Studio: `pnpm dev` from the repository root.
3. Sign in with your admin password.
4. Create or open a post, capture the views above.

### Demo mode (no GitHub)

1. Set `SOURCEDRAFT_DEMO_MODE=true` in `.env`, or leave GitHub vars empty.
2. Start Studio: `pnpm dev`.
3. Click **Explore demo mode** on the sign-in screen.
4. Capture the same views using sample posts and **Simulate publish**.

### General tips

- Use a readable browser width (about 1280px).
- Crop out tokens, private repo names, personal paths, or email addresses.
- On Linux, use **Print Screen** or a region capture tool.

## Before committing

Read [assets/README.md](assets/README.md) for naming and privacy rules.

If screenshots are not ready yet, the root README links here instead of showing broken images.

## Related testing

- Unit tests: `pnpm test`
- Playwright smoke tests (demo mode): `pnpm test:e2e` from `apps/studio` — see [getting-started.md](getting-started.md)
