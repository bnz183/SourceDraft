# SEO fields roadmap

SourceDraft Studio does not yet expose optional SEO frontmatter fields in the article schema. This document tracks a future, adapter-safe addition.

## Planned optional fields

| Field | Type | Purpose |
|-------|------|---------|
| `seoTitle` | string | Alternate title for `<title>` / Open Graph when different from `title` |
| `canonicalUrl` | string | Canonical URL hint for static site templates |
| `noindex` | boolean | Request noindex treatment in consuming site templates |

These fields are **site-template concerns**. SourceDraft stores them in frontmatter; each publishing target decides how to render them.

## Required code touchpoints

Before shipping in Studio UI:

1. `@sourcedraft/core` — extend `ArticleInput` / `Article`, optional validation, normalization
2. `@sourcedraft/adapter-astro-mdx` — emit fields in YAML when present
3. `@sourcedraft/adapter-markdown` — same
4. `apps/studio/server/posts.ts` — parse unknown/frontmatter keys on load
5. `apps/studio/src/lib/articleForm.ts` — form state + conversions
6. Studio Post details UI — optional inputs with calm guidance (not ranking promises)
7. Tests in core and adapters

## Out of scope for schema work

- External SEO APIs or scoring services
- Google ranking guarantees
- Site-specific hardcoding (QuBrite or otherwise)

## Content quality panel (shipped separately)

Studio already reports factual checks (word count, reading time, link/image counts, missing alt text, required-field gaps) without these SEO fields. When schema support lands, the quality panel can surface `seoTitle` length alongside `title` length.
