---
name: sourcedraft-ux-refactor
description: Use this when refactoring SourceDraft Studio UI/UX to make it professional, friendly, visually polished, accessible, and understandable for nontechnical users.
---

# SourceDraft UX Refactor Skill

Refactor SourceDraft Studio as a product-grade CMS interface for nontechnical writers and site owners.

Priorities:
1. Make the first screen immediately understandable: explain what SourceDraft does, what is connected, and what the user should do next.
2. Replace plain developer UI with a polished dashboard, onboarding wizard, content list, editor shell, media panel, preview state, and publishing status.
3. Use plain-language copy. Avoid exposing words like adapter, schema, frontmatter, MDX, repository, or config unless inside Advanced settings.
4. Apply progressive disclosure: show the simple path first, hide advanced configuration behind expandable Advanced sections.
5. Use consistent design tokens for spacing, border radius, typography, shadows, cards, empty states, buttons, badges, and status indicators.
6. Make every destructive or risky action reversible or confirmed.
7. Add visible system status: detected site type, connection state, unsaved changes, validation errors, last saved time, preview status, publish status.
8. Meet accessibility basics: keyboard focus states, labels, contrast, target size, readable typography, semantic HTML.
9. Preserve existing functionality. Do not break current auth, content loading, adapters, or publishing.
10. Add or update tests where possible, including smoke tests for dashboard, onboarding, editor, and adapter detection states.

Deliverables:
- A short UX audit before edits.
- A phased implementation plan with file paths.
- Component-level changes.
- Final verification commands.
- A final summary of what changed and what still needs manual review.
