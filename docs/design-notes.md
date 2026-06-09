# Design notes

## Typography

SourceDraft Studio uses the [IBM Plex](https://github.com/IBM/plex) family for a calm document-editor feel:

| Role | Family | Used for |
|------|--------|----------|
| UI | IBM Plex Sans | App shell, navigation, labels, buttons, forms, panels, post title |
| Writing | IBM Plex Serif | Article body textarea and preview output text |
| Mono | IBM Plex Mono | Code, slugs, repository paths, output file paths, technical values |

Weights loaded: Sans and Serif 400/500/600; Mono 400/500. Headings and section labels use 500–600, not heavy 700+ weights.

## Font delivery

Fonts are bundled with Studio via npm (`@fontsource/*`) and served from the app build. SourceDraft does not load fonts from Google Fonts or other external CDNs.

## Reading layout

The writing canvas and preview are capped around 72ch width. Body text uses ~18px size and ~1.65 line height for comfortable long-form reading. UI copy uses ~14px with ~1.5 line height.

CSS variables live in `apps/studio/src/index.css` (`--font-ui`, `--font-writing`, `--font-mono`, and the `--text-*` scale).

## Markdown toolbar (v0.2)

Studio keeps a plain `<textarea>` for the article body and adds a formatting toolbar that inserts Markdown around the current selection via `apps/studio/src/lib/markdownEditor.ts`.

**CodeMirror was not added in v0.2.** Toolbar actions only need selection ranges, text insertion, and focus restoration — all available on a textarea without a new dependency. CodeMirror 6 remains the preferred upgrade when we need syntax highlighting, bracket matching, multi-cursor editing, or built-in search/replace in source mode. Until then, the textarea keeps the bundle smaller and preserves MDX body text as a simple string end-to-end for preview and publish.
