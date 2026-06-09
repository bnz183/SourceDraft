# Editor and source mode

Studio uses a **Tiptap**-powered body editor with a formatting toolbar and slash commands. The article body remains a **Markdown/MDX string** in app state — preview, autosave, outline, and publish all use that string.

## Rich mode

- Toolbar: headings, bold, italic, lists, blockquote, code block, link, image, horizontal rule
- Slash commands: `/h1`, `/h2`, `/h3`, `/quote`, `/code`, `/image`, `/hr`, `/link`, `/internal`, `/callout`
- Unknown MDX JSX blocks render as locked placeholders in rich mode (not deleted)

## Source mode

Toggle **Source** in the editor toolbar to edit raw Markdown/MDX in a textarea. Use source mode when:

- Posts contain custom MDX components
- Rich mode cannot round-trip complex syntax cleanly
- You need exact whitespace or frontmatter-adjacent body text

Switching back to rich mode re-parses the body string. Complex MDX may appear as non-editable blocks.

## Limitations

- Custom markdown serializer — not full CommonMark; nested or unusual markdown may not round-trip perfectly in rich mode
- No collaborative editing, comments, or cloud sync
- Internal link slash command inserts the first loaded post when the picker is not opened manually

See also: [content-qa.md](content-qa.md) · [design-notes.md](design-notes.md)
