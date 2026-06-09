# Screenshots

Screenshots help first-time visitors understand SourceDraft without running the project locally. They are optional for development but useful for the README and release notes.

## Expected screenshots

Maintainers can add these under `docs/assets/` when captured from a real local session:

| File | What to show |
|------|----------------|
| `studio-overview.png` | **Posts** view — post list or empty state with publishing setup visible |
| `editor-preview.png` | **Write** view — body editor, post details panel, and MDX/Markdown preview |
| `media-upload.png` | Cover image upload area with accepted formats noted |
| `publish-success.png` | Publish confirmation after a successful commit |

Do not commit placeholder or generated fake screenshots.

## How to capture locally

1. Start Studio: `pnpm dev` from the repository root.
2. Sign in with your local admin password.
3. Use a **test repository** or sanitized config — not production secrets.
4. Open the view you want (Posts, Write, Settings).
5. Capture the browser window at a readable width (about 1280px works well).
6. Save as PNG with the filenames above into `docs/assets/`.
7. Review the image: crop out tokens, private repo names, personal paths, or email addresses if needed.

On Linux, many desktops support **Print Screen** or a region capture tool. Browser dev tools device toolbar is optional; full-window captures are fine.

## Before committing

Read [assets/README.md](assets/README.md) for naming and privacy rules.

If screenshots are not ready yet, the root README links here instead of showing broken images.
