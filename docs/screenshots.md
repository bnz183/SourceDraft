# Screenshots

Screenshots help first-time visitors understand SourceDraft without running the project locally. They live in `docs/assets/` and are referenced from the root README.

## Automated generation (demo mode)

Regenerate all release screenshots from Playwright using deterministic demo fixtures — no GitHub credentials required:

```bash
pnpm screenshots:generate
```

From `apps/studio` only:

```bash
pnpm exec playwright install chromium
pnpm screenshots:generate
```

This writes nine PNG files under `docs/assets/` at 1280×900. Commit updated images when Studio UI changes.

Smoke tests (no file writes) run separately:

```bash
pnpm test:e2e
```

CI runs `pnpm test:e2e` on every push/PR to `main` after build and unit tests.

## Required screenshots checklist

These files are maintained under `docs/assets/`:

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

## Manual capture (optional)

### GitHub mode

1. Configure `.env` with a **test repository** (not production secrets).
2. Start Studio: `pnpm dev` from the repository root.
3. Sign in with your admin password.
4. Create or open a post, capture the views above.

### Demo mode (no GitHub)

1. Set `SOURCEDRAFT_DEMO_MODE=true` in `.env`, or leave GitHub vars empty.
2. Start Studio: `pnpm dev`.
3. Enable **Demo mode** on the sign-in screen, then **Continue in demo**.
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
- Playwright smoke tests (demo mode): `pnpm test:e2e` — see [getting-started.md](getting-started.md)
- Screenshot regeneration: `pnpm screenshots:generate`
