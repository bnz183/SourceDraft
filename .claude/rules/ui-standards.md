# UI standards

Authoritative reference for SourceDraft Studio UI work. These are the bars every
Studio change must clear. Keep changes incremental and within the project's hard
rules (see `CLAUDE.md`, `no-scope-creep.md`). The Studio should read as a
shippable product, never a prototype.

## Foundations: design tokens

- **Spacing** uses the 8px-based scale tokens in `apps/studio/src/index.css`
  (`--space-1`…`--space-8`, with `--space-1: 4px` as the half-step). Do not add
  ad-hoc `px` padding/gap in new or touched rules — use tokens.
- **Type** uses the modular scale tokens (`--text-xs`…`--text-title`). Do not
  introduce new font sizes outside the scale.
- **Color** is fully tokenized. Components reference semantic tokens
  (`--text`, `--text-muted`, `--bg`, `--bg-panel`, `--border`, `--accent`,
  `--on-accent`, `--success-*`, `--warning-*`, `--error-*`, …) — never raw hex
  in component rules. New colors are added as tokens, defined for **both** light
  (`:root`) and dark (`:root[data-theme="dark"]` and the
  `prefers-color-scheme: dark` block).
- **Radii / elevation** use `--radius-*` and `--shadow-*` tokens.

## Theme

- Light and dark are both first-class. Dark follows the OS by default
  (`prefers-color-scheme`) and is overridable by an explicit user choice
  persisted via `lib/theme.ts` (`light` / `dark` / `system`).

## Laws of UX

- **Hick / Miller** — group related controls and keep visible choices small.
  Toolbars and panels are chunked into labeled groups. Avoid long flat rows of
  undifferentiated buttons.
- **Fitts** — primary actions are large and easy to reach. The Publish action is
  a large, high-contrast primary button, anchored so it is reachable without
  hunting or long scrolls.
- **Jakob** — match conventions of tools users already know (Google Docs /
  Notion): a persistent left navigation rail for primary destinations, a sticky
  top bar, and a familiar editor surface and toolbar.

## Onboarding and configuration

- **Progressive disclosure** — show essentials first; defer advanced/diagnostic
  options behind disclosure (`<details>`), secondary screens, or later steps.
- **One thing per page/step** — configuration is staged, not dumped as one dense
  form. First run must work with **zero credentials** (demo mode).

### Onboarding wizard & dashboard (Phase 5)

The sanctioned Phase 5 surfaces (`docs/roadmap.md`) hold to the same bars:

- The **first-run wizard** is staged one-thing-per-step, speaks plain language
  (no `adapter`/`frontmatter`/`MDX`/`contentDir` outside Advanced), keeps the
  zero-credential demo path reachable from every step, and reports detected
  site type from the existing detection engine rather than inventing results.
- Auto-applying detected config is a **risky action**: only when the existing
  safety check passes, and never overwrites a valid existing config without
  explicit confirmation (see "reversible or confirmed" actions).
- The **dashboard** is a status-first landing: detected site type, connection
  state, recent posts, and an obvious primary action — built from existing
  status/readiness pieces, no new status mechanisms.

## Accessibility — WCAG 2.2 AA (required)

- **Contrast**: body text ≥ **4.5:1**; large text (≥ 18px regular / 14px bold)
  and meaningful UI/graphical boundaries ≥ **3:1**. Verify in light **and** dark.
- **Target size (2.5.8)**: interactive controls ≥ **24×24** CSS px; prefer ~40px+
  for primary actions.
- **Visible focus**: every interactive element has a clear `:focus-visible`
  outline. Never remove focus styling without an equal replacement.
- Use semantic roles/labels (`aria-current`, `aria-label`, `role`,
  `aria-live` for status) so flows are operable by keyboard and screen reader.
- Respect `prefers-color-scheme`; respect `prefers-reduced-motion` for motion.

## Responsiveness and feedback

- User actions get visible feedback in **< 400ms** (state change, spinner, or
  status text).
- **Autosave** the working document and show live save status; never rely on a
  manual "save" the user can forget.
- Long/remote operations show progress and clear, actionable success/error
  states — without leaking secret values.

## Process

- Touch only what the change needs; do not refactor unrelated components.
- No new dependencies for styling — the system is plain CSS custom properties.
- Every UI change adds/updates unit and/or Playwright e2e coverage and passes
  `pnpm build && pnpm test && pnpm test:e2e`.

Related: `docs-style.md` (copy/tone), `no-scope-creep.md` (scope),
`docs/roadmap.md` (Phase 4 UX sequence).
