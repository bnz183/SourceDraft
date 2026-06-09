import { useState } from "react";
import type { Editor } from "@tiptap/react";
import type { PostSummary } from "../lib/posts.js";
import { InternalLinkPicker } from "../components/InternalLinkPicker.js";
import { editorDocToBody } from "./markdownRoundtrip.js";

type ToolbarButton = {
  label: string;
  ariaLabel: string;
  text: string;
  action: () => void;
};

type EditorToolbarProps = {
  editor: Editor | null;
  editorMode: "rich" | "source";
  bodyFieldId: string;
  latestImagePath: string | null;
  imageAlt: string;
  posts: PostSummary[];
  editingPath: string | null;
  onBodyChange: (body: string) => void;
  onModeChange: (mode: "rich" | "source") => void;
  onSelectInternalLink: (post: PostSummary) => void;
};

export function EditorToolbar({
  editor,
  editorMode,
  bodyFieldId,
  latestImagePath,
  imageAlt,
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

  const buttons: ToolbarButton[] =
    editor && editorMode === "rich"
      ? [
          {
            label: "H1",
            ariaLabel: "Heading 1",
            text: "H1",
            action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          },
          {
            label: "H2",
            ariaLabel: "Heading 2",
            text: "H2",
            action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          },
          {
            label: "H3",
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
            label: "Link",
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
            label: "Image",
            ariaLabel: "Insert image",
            text: "Image",
            action: () => {
              const path =
                latestImagePath?.trim() ||
                window.prompt("Image path (public URL or repo path)", "/images/")?.trim() ||
                "";
              if (path.length === 0) {
                return;
              }
              editor
                .chain()
                .focus()
                .setImage({ src: path, alt: imageAlt, title: imageAlt })
                .run();
            },
          },
          {
            label: "Horizontal rule",
            ariaLabel: "Horizontal rule",
            text: "HR",
            action: () => editor.chain().focus().setHorizontalRule().run(),
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
        {buttons.map((button) => (
          <button
            key={button.ariaLabel}
            type="button"
            className="editor-toolbar__button"
            aria-label={button.ariaLabel}
            title={button.label}
            disabled={editorMode !== "rich"}
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
