# Adapters

An adapter turns a validated SourceDraft article into content for a specific platform — YAML frontmatter plus a Markdown or MDX body.

Adapter choice is set in `sourcedraft.config.json` (`adapter` field) or overridden with `CMS_ADAPTER` in `.env`.

## Shipped

| Adapter | Package | Output |
|---------|---------|--------|
| **astro-mdx** | `@sourcedraft/adapter-astro-mdx` | Astro content collection `.mdx` file |
| **markdown** | `@sourcedraft/adapter-markdown` | Plain `.md` file with the same frontmatter fields |

Both adapters use the same universal article schema from `@sourcedraft/core`. Studio preview and publish pick the adapter at runtime.

## Future (not in repo yet)

- Next.js MDX
- Hugo Markdown (site-specific frontmatter)
- WordPress REST API
- Ghost API

These are planned directions, not shipped packages.
