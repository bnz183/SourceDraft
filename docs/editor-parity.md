# Editor parity

Honest comparison of writing-tool expectations. SourceDraft targets a professional editor feel while keeping Markdown/MDX as the source of truth.

| Feature | WordPress | Blogger | Medium | Google Docs / Word | Notion | SourceDraft |
|---------|-----------|---------|--------|-------------------|--------|-------------|
| Rich formatting | Shipped | Shipped | Shipped | Shipped | Shipped | **Shipped** (toolbar) |
| Headings | Shipped | Partial | Shipped | Shipped | Shipped | **Shipped** (H1–H3) |
| Lists | Shipped | Shipped | Shipped | Shipped | Shipped | **Shipped** |
| Links | Shipped | Shipped | Shipped | Shipped | Shipped | **Shipped** |
| Images | Shipped | Shipped | Shipped | Shipped | Shipped | **Shipped** (upload + insert) |
| Attachments | Shipped | Limited | Not really | Shipped | Shipped | **Partial** (PDF/file links via upload) |
| Tables | Shipped | Limited | Limited | Shipped | Shipped | **Planned** (Source mode only today) |
| Code blocks | Partial | No | Partial | No | Shipped | **Shipped** |
| Embeds / video | Shipped | Shipped | Shipped | Partial | Shipped | **Not planned** in toolbar (Source mode) |
| Markdown/MDX source | No | No | No | No | Partial export | **Shipped** |
| Preview generated output | Partial | Partial | Shipped | No | Partial | **Shipped** |
| Publish checklist | No | No | No | No | No | **Shipped** |
| Git-owned content | No | No | No | No | No | **Shipped** |
| Comments / collaboration | Shipped | Shipped | Partial | Shipped | Shipped | **Not planned** (MVP) |
| Track changes | Plugins | No | No | Shipped | Partial | **Not planned** |
| AI writing | Plugins | No | Partial | Shipped | Shipped | **Not shipped** (future agent workflows) |

## Where SourceDraft fits

SourceDraft is closer to **Medium + Git** than to WordPress hosting. You get a focused writing surface, validation, preview of the file your site will receive, and publish to your own repository or CMS — not a hosted website builder.

**Strengths today**

- Structured article fields (title, description, SEO, categories)
- Rich editor with source mode for MDX safety
- Media upload to git or Cloudinary (when configured)
- Content quality warnings and publish checklist
- Demo mode for safe exploration

**Honest gaps**

- No real-time collaboration or comments
- No built-in AI, Agent API, or MCP
- Attachment support is link-based (not embedded file viewers)
- Tables and complex embeds need Source mode
- Publishing requires server-side setup (not one-click for non-technical users)

## Status key

| Label | Meaning |
|-------|---------|
| Shipped | Works in current Studio |
| Partial | Limited or link-only |
| Planned | On roadmap, not implemented |
| Not planned | Out of scope for current MVP |

See [project-status.md](project-status.md) and [roadmap.md](roadmap.md) for ongoing work.
