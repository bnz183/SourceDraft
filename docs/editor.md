# Editor and source mode

Studio uses a **Tiptap**-powered body editor with a formatting toolbar and slash commands. The article body remains a **Markdown/MDX string** in app state — preview, autosave, outline, and publish all use that string.

## Rich mode toolbar

Formatting controls include:

- **Undo / redo**
- **Headings** — H1, H2, H3
- **Inline** — bold, italic, underline, strikethrough, inline code
- **Blocks** — bullet list, numbered list, blockquote, code block, horizontal rule
- **Insert** — link, internal link, image (with alt text prompt), attachment link (PDF/file)
- **Table** — shown as disabled; use Source mode for Markdown table syntax
- **Mode** — Rich / Source toggle

Upload an image or PDF in **Post details → Media**, then use **Image** or **Attach** in the toolbar to insert at the cursor. Attachments insert as normal Markdown links (`[filename](/path/to/file.pdf)`).

Underline serializes as HTML `<u>…</u>` in the body string. Strikethrough uses `~~text~~`.

## Slash commands

`/h1`, `/h2`, `/h3`, `/quote`, `/code`, `/image`, `/hr`, `/link`, `/internal`, `/callout`

Unknown MDX JSX blocks render as locked placeholders in rich mode (not deleted).

## Source mode

Toggle **Source** in the editor toolbar to edit raw Markdown/MDX in a textarea. Use source mode when:

- Posts contain custom MDX components
- Rich mode cannot round-trip complex syntax cleanly
- You need exact whitespace or GitHub-flavored table syntax

Switching back to rich mode re-parses the body string. Complex MDX may appear as non-editable blocks.

## Limitations

- Custom markdown serializer — not full CommonMark; nested or unusual markdown may not round-trip perfectly in rich mode
- No collaborative editing, comments, or cloud sync
- Tables are not editable in rich mode yet
- Video embeds are not supported in the toolbar — paste embeds in Source mode if your site allows them
- Internal link slash command inserts the first loaded post when the picker is not opened manually

See also: [editor-parity.md](editor-parity.md) · [content-qa.md](content-qa.md) · [design-notes.md](design-notes.md)
