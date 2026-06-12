# Brand assets guide

Direction for SourceDraft's visual identity. This is guidance for creating
real assets — it does not ship placeholder or fake assets. If an asset does
not exist yet, leave the slot empty rather than faking it.

## Identity in one line

A professional open-source developer tool: clean, technical, trustworthy.
Closer in spirit to Git, Vite, or Playwright than to a SaaS landing page.
The brand should signal "this tool respects your repository and your
credentials."

## Logo direction

- **Concept space:** drafting + source. Ideas worth exploring: a document
  glyph merged with a commit node or branch line; a cursor/caret on a
  Markdown `#`; a minimal "SD" monogram with a diff/branch accent.
- **Style:** flat, geometric, single-weight strokes. No gradients, no 3D, no
  mascots, no AI-generated look.
- **Variants needed:** square mark (favicon/avatar, works at 32px), and a
  horizontal lockup (mark + "SourceDraft" wordmark) for README and social
  preview.
- **Wordmark:** a clean sans-serif or semi-mono face; "SourceDraft" set as
  one word, capital S and D.
- **Format:** SVG source of truth; export PNG at 1x/2x. Keep SVGs hand-edited
  or optimized (no embedded raster data).

## Color and style direction

- **Base:** near-black/near-white neutrals (editor chrome territory), one
  restrained accent color used sparingly for actions and the logo accent.
  Candidates: a desaturated teal/cyan or amber — pick one, use it everywhere,
  avoid the default-blue-SaaS look and avoid purple-gradient AI clichés.
- **Semantic colors** stay conventional: green = success/shipped, amber =
  warning/experimental, red = error. Don't repurpose them decoratively.
- **Typography in assets:** system/sans for UI text, monospace for paths,
  frontmatter, and code — monospace is part of the identity (this is a tool
  about files).
- Generous whitespace; no drop shadows heavier than the Studio UI itself.

## Screenshot style

Screenshots are the primary "brand" surface today and must stay honest:

- Always generated from **demo mode** fixtures via `pnpm screenshots:generate`
  (1280×900) — reproducible, never staged with fake content
- Show real UI states: actual warnings in the content QA panel, the real
  demo banner, real setup-health rows
- Never include tokens, real repo names you don't want public, personal
  paths, or email addresses
- No marketing annotations (arrows, circles, emoji) baked into committed
  screenshots; annotate copies in blog posts if needed
- Same browser, same width, light theme consistently (until a dark theme
  exists — don't fake one)

Inventory and rules: [screenshots.md](screenshots.md).

## Demo video style

- Record the scripts in [demo-script.md](demo-script.md), demo mode only
- Screen-only capture at 1280px+ logical width; crop to the browser, hide
  bookmarks/extensions
- Calm pacing — no jump cuts every two seconds, no stock music with a "growth
  hacking" feel; quiet or no music is fine
- Captions or voiceover that states demo mode up front
- 60–90s for social embeds; the 3-minute cut for README/docs linking

## GitHub social preview

The 1280×640 image shown when the repo is shared:

- Lockup (logo + "SourceDraft") + one line: "Open-source publishing Studio
  for Markdown, MDX, and Git-backed content" — nothing else
- Solid neutral background or a *real* cropped screenshot as a muted backdrop
- No fake browser chrome around fake UI, no star counts, no badges

## README hero

- Keep the current approach: short text intro first, then the real
  `studio-overview.png` — readers should meet honest claims before imagery
- When a logo exists, a small centered mark above the H1 is enough; do not
  add a marketing banner image
- Badges (CI status, license) are fine; keep to one row, only badges that
  reflect real automated state

## Required vs optional

| Asset | Status | Priority |
|-------|--------|----------|
| Studio screenshots (×9, generated) | Exists | Required — keep current |
| GitHub repo description + topics | Settings task | Required before promotion |
| Square logo mark (SVG + PNG) | Not created | Required before heavy promotion |
| Social preview image (1280×640) | Not created | Required before heavy promotion |
| Horizontal lockup | Not created | Optional |
| Demo video (60–90s) | Not created | Optional, high value |
| Dark-theme variants | Not applicable yet | Optional, later |

Store finished assets under `docs/assets/brand/` with an `ATTRIBUTION.md` if
any external resources (fonts, icon bases) require it.
