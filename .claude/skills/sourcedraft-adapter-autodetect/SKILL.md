---
name: sourcedraft-adapter-autodetect
description: Use this when making SourceDraft plug-and-play by surfacing the existing framework/content detection in the Studio first-run flow and auto-applying it on high confidence. Reuse the detection engine; never build a new one.
---

# SourceDraft Adapter Autodetect Skill

Make SourceDraft self-configuring on first run by **surfacing the detection that
already exists** and applying it for the user — so a writer connects a repo and
gets the right site type, content location, and post fields without learning
adapter/config terminology.

## Reuse, do not rebuild

The detection engine already exists and is tested. Do not write a second one.

- `packages/setup/src/detectSetup.ts` — `detectSetup()` scans a repo for all
  shipped frameworks (Astro MDX, Next.js MDX, Hugo, Eleventy, Jekyll,
  Docusaurus, MkDocs, Nuxt Content), scores confidence (0–100), and returns a
  ranked `primary` suggestion plus `alternatives`, `warnings`, and an
  `onboarding`/`failure` message.
- `isSafeToApplySuggestion()` — the gate for auto-apply: confidence ≥ 70 **and**
  no warnings.
- `createConfigFromDetection()` — turns a suggestion into a
  `sourcedraft.config.json`.
- `packages/setup/src/contentRootDetection.ts` — content-directory candidates.
- `packages/setup/src/inferFrontmatterSchema.ts` — infers post fields and
  suggested categories from sample posts.
- `apps/studio/src/components/SetupDetectionPanel.tsx` — existing UI that already
  renders detection results (today only inside Advanced Settings).
- Framework display names come from adapter `previewMeta.label` via
  `adapterRegistry` (`packages/adapters/src/`) — do not hardcode them.

## Behaviour rules

1. **Surface, then auto-apply.** Run detection during first run, show the result
   in plain language, then offer "Use these settings" as the primary action.
2. **Auto-apply only when safe.** Apply automatically only when
   `isSafeToApplySuggestion()` is true. When ambiguous (low confidence or close
   scores), show alternatives and require the user to choose.
3. **Never destroy config.** Do not overwrite a valid existing
   `sourcedraft.config.json` without explicit confirmation. Write through the
   existing config-generation path.
4. **Plain language.** Report "We found an Astro site" / "Where your posts live"
   — keep `adapter`, `frontmatter`, `MDX`, `contentDir`, and `config` behind an
   Advanced disclosure. Aligns with `sourcedraft-ux-refactor`.
5. **No fabrication.** Report what detection actually found, including low
   confidence and warnings. Never invent a framework or a content path.
6. **Reuse the existing detection endpoint.** If `SetupDetectionPanel` already
   calls a server route, the wizard reuses it — do not add a second endpoint.

## Tests

- Extend `packages/setup/src/detectSetup.test.ts` only if auto-apply thresholds
  change.
- Add Playwright e2e (demo mode) covering the detected-site step and auto-apply
  vs. choose-an-alternative paths.

Related: `sourcedraft-ux-refactor` (overall Studio UX), `docs/roadmap.md`
Phase 5, `.claude/rules/ui-standards.md`.
