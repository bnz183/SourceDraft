import { useState } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import type { PostSummary } from "../lib/posts.js";
import { InternalLinkPicker } from "../components/InternalLinkPicker.js";
import { editorDocToBody } from "./markdownRoundtrip.js";
import { isToolbarButtonEnabled } from "./toolbarButton.js";

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
  active?: boolean;
  disabled?: boolean;
  title?: string;
};

type ToolbarState = {
  paragraph: boolean;
  heading1: boolean;
  heading2: boolean;
  heading3: boolean;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  code: boolean;
  link: boolean;
  bulletList: boolean;
  orderedList: boolean;
  blockquote: boolean;
  codeBlock: boolean;
  canUndo: boolean;
  canRedo: boolean;
};

const INACTIVE_STATE: ToolbarState = {
  paragraph: false,
  heading1: false,
  heading2: false,
  heading3: false,
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  code: false,
  link: false,
  bulletList: false,
  orderedList: false,
  blockquote: false,
  codeBlock: false,
  canUndo: false,
  canRedo: false,
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

  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }): ToolbarState => {
      if (!currentEditor) {
        return INACTIVE_STATE;
      }

      return {
        paragraph: currentEditor.isActive("paragraph"),
        heading1: currentEditor.isActive("heading", { level: 1 }),
        heading2: currentEditor.isActive("heading", { level: 2 }),
        heading3: currentEditor.isActive("heading", { level: 3 }),
        bold: currentEditor.isActive("bold"),
        italic: currentEditor.isActive("italic"),
        underline: currentEditor.isActive("underline"),
        strike: currentEditor.isActive("strike"),
        code: currentEditor.isActive("code"),
        link: currentEditor.isActive("link"),
        bulletList: currentEditor.isActive("bulletList"),
        orderedList: currentEditor.isActive("orderedList"),
        blockquote: currentEditor.isActive("blockquote"),
        codeBlock: currentEditor.isActive("codeBlock"),
        canUndo: currentEditor.can().undo(),
        canRedo: currentEditor.can().redo(),
      };
    },
  });

  const state = toolbarState ?? INACTIVE_STATE;

  function runEditorAction(action: () => void) {
    if (!editor || editorMode !== "rich") {
      return;
    }

    action();
    onBodyChange(editorDocToBody(editor.getJSON()));
  }

  function insertOrEditLink(currentEditor: Editor) {
    const previousHref = currentEditor.getAttributes("link").href as
      | string
      | undefined;
    const input = window.prompt(
      "Link URL (leave empty to remove the link)",
      previousHref ?? "https://",
    );
    if (input === null) {
      return;
    }

    const href = input.trim();
    if (href.length === 0) {
      currentEditor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    if (currentEditor.state.selection.empty && !state.link) {
      currentEditor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: "link text",
          marks: [{ type: "link", attrs: { href } }],
        })
        .run();
      return;
    }

    currentEditor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href })
      .run();
  }

  function insertFileLink(currentEditor: Editor) {
    let path: string;
    let filename: string;

    if (latestUpload?.kind === "pdf") {
      path = latestUpload.publicPath;
      filename = latestUpload.filename;
    } else {
      const prompted = window
        .prompt(
          "File path or URL — upload PDFs in “Images & files” first, then paste the path here",
          "/files/",
        )
        ?.trim();
      if (!prompted) {
        return;
      }
      path = prompted;
      filename = path.split("/").pop() || path;
    }

    const label = filename.replace(/\.pdf$/iu, "") || filename;
    currentEditor
      .chain()
      .focus()
      .insertContent({
        type: "text",
        text: label,
        marks: [{ type: "link", attrs: { href: path } }],
      })
      .run();
  }

  const groups: { name: string; buttons: ToolbarButton[] }[] =
    editor && editorMode === "rich"
      ? [
          {
            name: "Text style",
            buttons: [
              {
                label: "Paragraph",
                ariaLabel: "Paragraph",
                text: "¶",
                active: state.paragraph,
                action: () => editor.chain().focus().setParagraph().run(),
              },
              {
                label: "Heading 1",
                ariaLabel: "Heading 1",
                text: "H1",
                active: state.heading1,
                action: () =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run(),
              },
              {
                label: "Heading 2",
                ariaLabel: "Heading 2",
                text: "H2",
                active: state.heading2,
                action: () =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run(),
              },
              {
                label: "Heading 3",
                ariaLabel: "Heading 3",
                text: "H3",
                active: state.heading3,
                action: () =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run(),
              },
            ],
          },
          {
            name: "Formatting",
            buttons: [
              {
                label: "Bold",
                ariaLabel: "Bold",
                text: "B",
                active: state.bold,
                action: () => editor.chain().focus().toggleBold().run(),
              },
              {
                label: "Italic",
                ariaLabel: "Italic",
                text: "I",
                active: state.italic,
                action: () => editor.chain().focus().toggleItalic().run(),
              },
              {
                label: "Underline",
                ariaLabel: "Underline",
                text: "U",
                active: state.underline,
                action: () => editor.chain().focus().toggleUnderline().run(),
              },
              {
                label: "Strikethrough",
                ariaLabel: "Strikethrough",
                text: "S",
                active: state.strike,
                action: () => editor.chain().focus().toggleStrike().run(),
              },
              {
                label: "Inline code",
                ariaLabel: "Inline code",
                text: "</>",
                active: state.code,
                action: () => editor.chain().focus().toggleCode().run(),
              },
              {
                label: "Clear formatting",
                ariaLabel: "Clear formatting",
                text: "Clear",
                action: () =>
                  editor.chain().focus().unsetAllMarks().clearNodes().run(),
              },
            ],
          },
          {
            name: "Blocks",
            buttons: [
              {
                label: "Bullet list",
                ariaLabel: "Bullet list",
                text: "• List",
                active: state.bulletList,
                action: () => editor.chain().focus().toggleBulletList().run(),
              },
              {
                label: "Numbered list",
                ariaLabel: "Numbered list",
                text: "1. List",
                active: state.orderedList,
                action: () => editor.chain().focus().toggleOrderedList().run(),
              },
              {
                label: "Blockquote",
                ariaLabel: "Blockquote",
                text: "Quote",
                active: state.blockquote,
                action: () => editor.chain().focus().toggleBlockquote().run(),
              },
              {
                label: "Code block",
                ariaLabel: "Code block",
                text: "```",
                active: state.codeBlock,
                action: () => editor.chain().focus().toggleCodeBlock().run(),
              },
              {
                label: "Horizontal rule",
                ariaLabel: "Horizontal rule",
                text: "HR",
                action: () => editor.chain().focus().setHorizontalRule().run(),
              },
            ],
          },
          {
            name: "Insert",
            buttons: [
              {
                label: "Link",
                ariaLabel: "Insert or edit link",
                text: "Link",
                active: state.link,
                action: () => insertOrEditLink(editor),
              },
              {
                label: "Image",
                ariaLabel: "Insert image",
                text: "Image",
                action: () => {
                  const path =
                    latestImagePath?.trim() ||
                    (latestUpload?.kind === "image" ? latestUpload.publicPath : "") ||
                    window
                      .prompt("Image path (public URL or repo path)", "/images/")
                      ?.trim() ||
                    "";
                  if (path.length === 0) {
                    return;
                  }
                  const alt =
                    window.prompt("Alt text (for accessibility)", imageAlt)?.trim() ||
                    imageAlt;
                  editor
                    .chain()
                    .focus()
                    .setImage({ src: path, alt, title: alt })
                    .run();
                },
              },
              {
                label: "File link",
                ariaLabel: "Insert file link",
                text: "File",
                disabled: !mediaUploadAvailable,
                title: mediaUploadAvailable
                  ? "Insert a link to an uploaded PDF or file"
                  : "File attachments are not enabled for this media provider yet.",
                action: () => insertFileLink(editor),
              },
            ],
          },
          {
            name: "History",
            buttons: [
              {
                label: "Undo",
                ariaLabel: "Undo",
                text: "Undo",
                disabled: !state.canUndo,
                action: () => editor.chain().focus().undo().run(),
              },
              {
                label: "Redo",
                ariaLabel: "Redo",
                text: "Redo",
                disabled: !state.canRedo,
                action: () => editor.chain().focus().redo().run(),
              },
            ],
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
        {groups.map((group, groupIndex) => (
          <div
            key={group.name}
            className="editor-toolbar__group"
            role="group"
            aria-label={group.name}
            data-group-index={groupIndex}
          >
            {group.buttons.map((button) => (
              <button
                key={button.ariaLabel}
                type="button"
                className={
                  button.active
                    ? "editor-toolbar__button editor-toolbar__button--active"
                    : "editor-toolbar__button"
                }
                aria-label={button.ariaLabel}
                aria-pressed={button.active ?? undefined}
                title={button.title ?? button.label}
                disabled={!isToolbarButtonEnabled(button.disabled, editorMode)}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => {
                  if (!isToolbarButtonEnabled(button.disabled, editorMode)) {
                    return;
                  }
                  runEditorAction(button.action);
                }}
              >
                <span aria-hidden="true">{button.text}</span>
              </button>
            ))}
            {group.name === "Insert" && (
              <button
                type="button"
                className="editor-toolbar__button"
                aria-label="Insert internal link"
                title="Internal link"
                aria-expanded={internalLinkOpen}
                disabled={!isToolbarButtonEnabled(false, editorMode)}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => {
                  if (!isToolbarButtonEnabled(false, editorMode)) {
                    return;
                  }
                  setInternalLinkOpen(true);
                }}
              >
                <span aria-hidden="true">Internal</span>
              </button>
            )}
          </div>
        ))}
        <div className="editor-toolbar__spacer" />
        <div
          className="editor-toolbar__group"
          role="group"
          aria-label="Editing mode"
        >
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
