# Editor parity

How the SourceDraft editor compares to the writing experiences people already
know. The other tools are mature products with much larger editing teams —
this table is about setting honest expectations, not claiming parity today.

Statuses for the SourceDraft column: **shipped**, **partial**, **planned**,
**not shipped**.

| Feature | WordPress | Blogger | Medium | Google Docs / Word | Notion | SourceDraft |
|---------|-----------|---------|--------|--------------------|--------|-------------|
| Rich formatting (bold/italic/strike/code) | Yes | Yes | Yes | Yes | Yes | **shipped** |
| Headings | Yes | Yes | Yes | Yes | Yes | **shipped** (H1–H3) |
| Lists | Yes | Yes | Yes | Yes | Yes | **shipped** (flat lists) |
| Links | Yes | Yes | Yes | Yes | Yes | **shipped** (insert/edit/remove + internal links) |
| Images | Yes | Yes | Yes | Yes | Yes | **shipped** (upload to repo or insert by path) |
| Attachments | Yes | No | No | Drive-based | Yes | **partial** (PDF upload + file links; other types link-only) |
| Tables | Yes | Yes | No | Yes | Yes | **planned** (needs reliable Markdown serialization first) |
| Code blocks | Yes (plugin-dependent) | No | Partial | No | Yes | **shipped** (fenced, with language) |
| Embeds (video, social) | Yes | Yes | Yes | Partial | Yes | **planned** (MDX components pass through in source mode) |
| Markdown/MDX source mode | Partial | Partial (HTML) | No | No | Partial (export) | **shipped** |
| Preview of generated output file | No | No | No | No | No | **shipped** (exact path + frontmatter) |
| Publish checklist / validation | Partial | No | No | No | No | **shipped** |
| Git-owned content | Plugin-dependent | No | No | No | No | **shipped** (plain `.md`/`.mdx` in your repo) |
| Comments / collaboration | Yes | Yes | Yes | Yes | Yes | **not shipped** |
| Track changes / revisions | Yes | Partial | Partial | Yes | Yes | **not shipped** in Studio (Git history covers committed versions) |
| Underline | Yes | Yes | No | Yes | Partial | **shipped** (toolbar button; serialized as `<u>…</u>` HTML passthrough) |
| Text alignment | Yes | Yes | No | Yes | Partial | **not shipped** (no portable Markdown output) |

## Reading this honestly

- WordPress, Notion, and Google Docs are far ahead on collaboration and
  block-editing maturity. If you need real-time co-writing, use them.
- SourceDraft's strengths are the bottom half of the table: source mode,
  exact output preview, validation, and Git-owned portable content.
- "Planned" means it is on [roadmap.md](roadmap.md) with no date — not that it
  is partially hidden somewhere.

See also: [editor.md](editor.md) · [comparison.md](comparison.md) · [roadmap.md](roadmap.md)
