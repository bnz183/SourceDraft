# Content QA

SourceDraft runs **non-blocking** editorial checks while you write. They do not block publish unless required-field validation fails.

## Post details panel — Content quality

Warnings and suggestions for the current draft:

| Check | Type |
|-------|------|
| Meta title / description length | Guidance |
| Cover image alt text | Warning when hero is set |
| Image alt text in Markdown body | Warning |
| Duplicate H1 headings | Guidance |
| Long article without H2 sections | Guidance |
| Very short body | Guidance |
| Many external links | Guidance |
| Broken-looking internal links | Warning (vs loaded post slugs) |
| Missing social image when no hero | Guidance |

Required-field validation errors (title, slug, dates, etc.) also appear here.

## SEO / Sharing panel

Optional `metaTitle`, `metaDescription`, `canonicalUrl`, `socialImage`, and cover alt feed into frontmatter on publish. Soft length warnings use the same guidance thresholds as content quality.

## Publish checklist

The publish bar shows a compact checklist before you click **Publish**:

- Validation status
- Output path
- Publish mode and target branch / PR branch
- Draft vs live
- Media and SEO warning counts

## Content audit (existing posts)

Settings → **Content audit** scans posts already in your `contentDir` (read-only, no file changes):

- Valid vs invalid frontmatter
- Missing required fields and unsupported frontmatter keys
- Duplicate slugs
- Invalid dates
- **Source-only** posts with complex MDX (imports, exports, JSX)
- Ignored non-`.md` / `.mdx` files

Use the audit before importing an existing blog into SourceDraft editing workflows.

See also: [seo-fields.md](seo-fields.md) · [setup-detection.md](setup-detection.md)
