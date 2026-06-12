# Docs and copy style

## Tone

Professional open-source developer tool: clean, technical, precise,
trustworthy. Not generic SaaS marketing, not AI-generated filler, not startup
hype, not fake enterprise. Write like the maintainer of a tool people trust
with their repositories and credentials.

## Positioning to emphasize

- Git-owned content and portability (plain `.md`/`.mdx` in the user's repo)
- Adapter/publisher architecture (one schema, many targets)
- Local/private control; credentials stay server-side
- Publishing confidence: validation, exact output preview, content QA,
  publish checklist, demo mode

## Competitors

Respect Decap CMS, TinaCMS, CloudCannon, GitCMS, WordPress, and Ghost. State
plainly where they are stronger (maturity, hosting, ecosystems, visual
editing) and where SourceDraft differs. Never attack, never imply they are
bad choices, never invent their weaknesses.

## Evidence rules

- Feature claims must match shipped code; check `docs/project-status.md`.
- Acceptable sources: this repository, official docs of the tools discussed,
  reputable open-source ecosystem guidance, neutral UX/product principles.
- Not acceptable as neutral evidence: vendor marketing pages, SEO listicles,
  fabricated statistics, competitor sales pages. Real user/founder reviews may
  be cited only as clearly-marked anecdotes.
- No fake screenshots, metrics, benchmarks, or testimonials.

## UX writing principles

Optimize docs and UI text for: fast first success, low cognitive load, clear
system status, obvious next action, recognition over recall, error
prevention, user control and recovery, progressive disclosure, transparent
limitations, and trust around credentials and publishing. The reader is
technical but may be new to Git-based CMS workflows.

## Mechanics

- Sentence-case headings, short paragraphs, tables for matrices.
- Every doc links onward to the next logical doc.
- Commands shown must actually work from the repo root (or state the cwd).
- Mark experimental/partial features inline, not only in a footnote.
- Keep "MVP password auth is intended for local/private use" warnings wherever
  exposure to the public internet could be implied.
