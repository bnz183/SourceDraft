# Editor and source mode

Studio uses a **Tiptap**-powered body editor with a formatting toolbar and slash commands. The article body remains a **Markdown/MDX string** in app state — preview, autosave, outline, and publish all use that string.

## Rich mode toolbar

The toolbar groups controls and shows active states for the formatting under the cursor:

| Group | Controls |
|-------|----------|
| Text style | Paragraph, Heading 1–3 |
| Formatting | Bold, italic, underline, strikethrough, inline code, clear formatting |
| Blocks | Bullet list, numbered list, blockquote, code block, horizontal rule |
| Insert | Link (insert/edit/remove), image, file link, internal link |
| History | Undo, redo (disabled when nothing to undo/redo) |
| Mode | Rich / Source toggle |

- Slash commands: `/h1`, `/h2`, `/h3`, `/quote`, `/code`, `/image`, `/hr`, `/link`, `/internal`, `/callout`
- Unknown MDX JSX blocks render as locked placeholders in rich mode (not deleted)
- **Link** edits or removes the link under the cursor; leave the URL empty to remove it
- **Image** uses the most recently uploaded image when one exists, otherwise asks for a path
- **File link** inserts a Markdown link to a file path (for example a PDF uploaded in **Images & files**) — it does not upload anything itself

## Source mode

Toggle **Source** in the editor toolbar to edit raw Markdown/MDX in a textarea. Use source mode when:

- Posts contain custom MDX components
- Rich mode cannot round-trip complex syntax cleanly
- You need exact whitespace or GitHub-flavored table syntax

Switching back to rich mode re-parses the body string. Complex MDX may appear as non-editable blocks.

## Limitations

- Custom markdown serializer — not full CommonMark; nested or unusual markdown may not round-trip perfectly in rich mode
- Underline serializes as an `<u>…</u>` HTML passthrough, which renders in both `.md` and `.mdx`; text alignment and tables are **not** supported in rich mode because they have no portable Markdown output — see [editor-parity.md](editor-parity.md) for what is planned
- File uploads accept images and PDF only ([media.md](media.md)); other file types must be hosted elsewhere and linked
- No collaborative editing, comments, or cloud sync
- Video embeds are not supported in the toolbar — paste embeds in Source mode if your site allows them
- Internal link slash command inserts the first loaded post when the picker is not opened manually

See also: [editor-parity.md](editor-parity.md) · [content-qa.md](content-qa.md) · [design-notes.md](design-notes.md)
