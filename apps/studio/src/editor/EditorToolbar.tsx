import { useState } from "react";
import type { Editor } from "@tiptap/react";
import type { PostSummary } from "../lib/posts.js";
import { InternalLinkPicker } from "../components/InternalLinkPicker.js";
import { editorDocToBody } from "./markdownRoundtrip.js";

export type LatestMediaUpload = {
  publicPath: string;
  filename: string;
  kind: "image" | "pdf";
};

type ToolbarButton = {
  label: string;
  ariaLabel: string;
  text: string;
  action: () => void;
  disabled?: boolean;
  title?: string;
};

type EditorToolbarProps = {
  editor: Editor | null;
  editorMode: "rich" | "source";
  bodyFieldId: string;
  latestImagePath: string | null;
  latestUpload: LatestMediaUpload | null;
  imageAlt: string;
  mediaUploadAvailable: boolean;
  posts: PostSummary[];
  editingPath: string | null;
  onBodyChange: (body: string) => void;
  onModeChange: (mode: "rich" | "source") => void;
  onSelectInternalLink: (post: PostSummary) => void;
};

function attachmentLabel(filename: string): string {
  return filename.replace(/\.pdf$/iu, "") || filename;
}

export function EditorToolbar({
  editor,
  editorMode,
  bodyFieldId,
  latestImagePath,
  latestUpload,
  imageAlt,
  mediaUploadAvailable,
  posts,
  editingPath,
  onBodyChange,
  onModeChange,
  onSelectInternalLink,
}: EditorToolbarProps) {
  const [internalLinkOpen, setInternalLinkOpen] = useState(false);

  function runEditorAction(action: () => void) {
    if (!editor || editorMode !== "rich") {
      return;
    }

    action();
    onBodyChange(editorDocToBody(editor.getJSON()));
  }

  function promptImageInsert(): void {
    if (!editor) {
      return;
    }

    const path =
      latestImagePath?.trim() ||
      (latestUpload?.kind === "image" ? latestUpload.publicPath : "") ||
      window.prompt("Image path (public URL or repo path)", "/images/")?.trim() ||
      "";

    if (path.length === 0) {
      return;
    }

    const alt =
      window.prompt("Alt text (for accessibility)", imageAlt)?.trim() || imageAlt;

    editor
      .chain()
      .focus()
      .setImage({ src: path, alt, title: alt })
      .run();
  }

  function promptAttachmentInsert(): void {
    if (!editor) {
      return;
    }

    let path = "";
    let filename = "Document";

    if (latestUpload?.kind === "pdf") {
      path = latestUpload.publicPath;
      filename = latestUpload.filename;
    } else {
      path =
        window.prompt("File path (public URL or repo path)", "/files/")?.trim() ||
        "";
      if (path.length === 0) {
        return;
      }
      const segments = path.split("/");
      filename = segments[segments.length - 1] || "Document";
    }

    const label = attachmentLabel(filename);
    editor
      .chain()
      .focus()
      .insertContent({
        type: "text",
        text: label,
        marks: [{ type: "link", attrs: { href: path } }],
      })
      .run();
  }

  const richDisabled = editorMode !== "rich" || !editor;

  const formattingButtons: ToolbarButton[] =
    editor && editorMode === "rich"
      ? [
          {
            label: "Undo",
            ariaLabel: "Undo",
            text: "Undo",
            action: () => editor.chain().focus().undo().run(),
            disabled: !editor.can().undo(),
          },
          {
            label: "Redo",
            ariaLabel: "Redo",
            text: "Redo",
            action: () => editor.chain().focus().redo().run(),
            disabled: !editor.can().redo(),
          },
          {
            label: "Heading 1",
            ariaLabel: "Heading 1",
            text: "H1",
            action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          },
          {
            label: "Heading 2",
            ariaLabel: "Heading 2",
            text: "H2",
            action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          },
          {
            label: "Heading 3",
            ariaLabel: "Heading 3",
            text: "H3",
            action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          },
          {
            label: "Bold",
            ariaLabel: "Bold",
            text: "B",
            action: () => editor.chain().focus().toggleBold().run(),
          },
          {
            label: "Italic",
            ariaLabel: "Italic",
            text: "I",
            action: () => editor.chain().focus().toggleItalic().run(),
          },
          {
            label: "Underline",
            ariaLabel: "Underline",
            text: "U",
            action: () => editor.chain().focus().toggleUnderline().run(),
          },
          {
            label: "Strikethrough",
            ariaLabel: "Strikethrough",
            text: "S",
            action: () => editor.chain().focus().toggleStrike().run(),
          },
          {
            label: "Inline code",
            ariaLabel: "Inline code",
            text: "`",
            action: () => editor.chain().focus().toggleCode().run(),
          },
          {
            label: "Bullet list",
            ariaLabel: "Bullet list",
            text: "• List",
            action: () => editor.chain().focus().toggleBulletList().run(),
          },
          {
            label: "Numbered list",
            ariaLabel: "Numbered list",
            text: "1. List",
            action: () => editor.chain().focus().toggleOrderedList().run(),
          },
          {
            label: "Blockquote",
            ariaLabel: "Blockquote",
            text: "Quote",
            action: () => editor.chain().focus().toggleBlockquote().run(),
          },
          {
            label: "Code block",
            ariaLabel: "Code block",
            text: "```",
            action: () => editor.chain().focus().toggleCodeBlock().run(),
          },
          {
            label: "Insert link",
            ariaLabel: "Insert link",
            text: "Link",
            action: () => {
              const href =
                window.prompt("Link URL", "https://")?.trim() || "https://";
              editor
                .chain()
                .focus()
                .insertContent({
                  type: "text",
                  text: "link text",
                  marks: [{ type: "link", attrs: { href } }],
                })
                .run();
            },
          },
          {
            label: "Insert image",
            ariaLabel: "Insert image",
            text: "Image",
            action: () => {
              promptImageInsert();
            },
          },
          {
            label: "Insert attachment",
            ariaLabel: "Insert attachment",
            text: "Attach",
            action: () => {
              promptAttachmentInsert();
            },
            disabled: !mediaUploadAvailable,
            title: mediaUploadAvailable
              ? "Insert a download link for an uploaded PDF or file"
              : "Upload media in Post details after GitHub or demo mode is configured",
          },
          {
            label: "Horizontal rule",
            ariaLabel: "Horizontal rule",
            text: "HR",
            action: () => editor.chain().focus().setHorizontalRule().run(),
          },
          {
            label: "Table",
            ariaLabel: "Table",
            text: "Table",
            action: () => {},
            disabled: true,
            title:
              "Tables are not supported in rich mode yet. Use Source mode for Markdown table syntax.",
          },
        ]
      : [];

  return (
    <div className="editor-toolbar-wrap">
      <div
        className="editor-toolbar"
        role="toolbar"
        aria-label="Editor formatting"
        aria-controls={bodyFieldId}
      >
        {formattingButtons.map((button) => (
          <button
            key={button.ariaLabel}
            type="button"
            className="editor-toolbar__button"
            aria-label={button.ariaLabel}
            title={button.title ?? button.label}
            disabled={richDisabled || button.disabled === true}
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={() => {
              runEditorAction(button.action);
            }}
          >
            <span aria-hidden="true">{button.text}</span>
          </button>
        ))}
        <button
          type="button"
          className="editor-toolbar__button"
          aria-label="Insert internal link"
          title="Internal link"
          aria-expanded={internalLinkOpen}
          disabled={richDisabled}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={() => {
            setInternalLinkOpen(true);
          }}
        >
          <span aria-hidden="true">Internal</span>
        </button>
        <div className="editor-toolbar__spacer" />
        <button
          type="button"
          className={
            editorMode === "rich"
              ? "editor-toolbar__button editor-toolbar__button--active"
              : "editor-toolbar__button"
          }
          aria-pressed={editorMode === "rich"}
          aria-label="Rich text mode"
          title="Rich text mode"
          onClick={() => onModeChange("rich")}
        >
          Rich
        </button>
        <button
          type="button"
          className={
            editorMode === "source"
              ? "editor-toolbar__button editor-toolbar__button--active"
              : "editor-toolbar__button"
          }
          aria-pressed={editorMode === "source"}
          aria-label="Source mode"
          title="Source mode — edit raw Markdown or MDX"
          onClick={() => onModeChange("source")}
        >
          Source
        </button>
      </div>

      {internalLinkOpen && (
        <InternalLinkPicker
          posts={posts}
          editingPath={editingPath}
          body=""
          selection={{ start: 0, end: 0 }}
          textareaRef={{ current: null }}
          onBodyChange={() => {}}
          onSelectPost={(post) => {
            onSelectInternalLink(post);
            setInternalLinkOpen(false);
          }}
          onClose={() => {
            setInternalLinkOpen(false);
          }}
        />
      )}
    </div>
  );
}
