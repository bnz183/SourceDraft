# No scope creep

SourceDraft launches first as a genuinely useful free and open-source AGPL
project. The free version must not be artificially crippled, and monetization
is **not** implemented now.

## Forbidden in the current phase

Do not implement, scaffold, stub, or document as available:

- Paywalls, billing, SaaS plans, license gates, or feature flags that gate
  open-source functionality
- Telemetry or analytics collection of any kind
- OAuth, user accounts, team accounts, or RBAC
- Hosted / multi-tenant Studio
- Plugin marketplace
- AI writing tools
- Large UI redesigns — **except** the sanctioned, sequenced Phase 4 and Phase 5
  UX/UI work in `docs/roadmap.md`, measured against
  `.claude/rules/ui-standards.md`. Phase 4 is polish and accessibility work on
  existing features. Phase 5 is a guided first-run onboarding wizard and a
  status-first dashboard that surface and auto-apply the **existing** site
  detection (`packages/setup/src/detectSetup.ts`) — a sanctioned new UX surface,
  not a new product capability. Both add no forbidden feature above (no billing,
  telemetry, OAuth, RBAC, team accounts, hosted/multi-tenant Studio, plugin
  marketplace, or AI writing).

Also forbidden: fake screenshots, fake metrics, fake benchmarks, and
production/enterprise overclaims in any doc or UI string.

## Allowed to mention (roadmap only)

Future commercial possibilities (hosted SourceDraft Cloud, managed onboarding,
OAuth/team accounts, RBAC, managed media, premium support, agency workspaces,
migration services, dual licensing) may appear in `docs/roadmap.md` as
clearly-labeled future options — never as current features, never as code.

## Decision filter

Classify every proposed change as one of:

1. **True launch blocker** — broken, misleading, insecure, or missing piece
   that would embarrass the project on day one. Do it.
2. **High-value polish** — improves first success, clarity, or trust with low
   risk. Do it if cheap and in scope.
3. **Later roadmap** — useful but not now. Write it down in `docs/roadmap.md`
   or an issue; do not implement.
4. **Explicitly not now** — anything on the forbidden list. Refuse, even if
   requested casually, and point to this file.
