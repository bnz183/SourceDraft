# Adapters

An adapter turns a validated SourceDraft article into content for a specific platform — today, an Astro MDX file with YAML frontmatter.

## Shipped

- **astro-mdx** — `@sourcedraft/adapter-astro-mdx`

## Planned (not in repo yet)

- Next.js MDX
- Hugo Markdown
- WordPress REST API
- Ghost API

Adapter choice is set in `sourcedraft.config.json` (`adapter` field). Only `astro-mdx` is implemented in this MVP.
