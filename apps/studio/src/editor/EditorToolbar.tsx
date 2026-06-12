import { useRef, useState, type ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import type { PostSummary } from "../lib/posts.js";
import { InternalLinkPicker } from "../components/InternalLinkPicker.js";
import { editorDocToBody } from "./markdownRoundtrip.js";
import {
  attachmentLabel,
  EDITOR_ATTACHMENT_ACCEPT,
  EDITOR_IMAGE_ACCEPT,
  uploadEditorMediaFile,
} from "./editorMedia.js";
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconAttachment,
  IconBold,
  IconCode,
  IconCodeBlock,
  IconHr,
  IconImage,
  IconItalic,
  IconLink,
  IconListBullet,
  IconListNumbered,
  IconQuote,
  IconRedo,
  IconStrike,
  IconSubscript,
  IconSuperscript,
  IconTable,
  IconUnderline,
  IconUndo,
  IconVideo,
} from "./toolbarIcons.js";

type EditorToolbarProps = {
  editor: Editor | null;
  editorMode: "rich" | "source";
  bodyFieldId: string;
  latestImagePath: string | null;
  imageAlt: string;
  posts: PostSummary[];
  editingPath: string | null;
  mediaUploadReady: boolean;
  onBodyChange: (body: string) => void;
  onModeChange: (mode: "rich" | "source") => void;
  onSelectInternalLink: (post: PostSummary) => void;
  onImageUploadSuccess?: (publicPath: string) => void;
};

type ToolbarAction = {
  id: string;
  label: string;
  icon?: ReactNode;
  text?: string;
  isActive?: () => boolean;
  isDisabled?: () => boolean;
  action: () => void;
};

function ToolbarGroup({ children }: { children: ReactNode }) {
  return <div className="editor-toolbar__group">{children}</div>;
}

function ToolbarDivider() {
  return <div className="editor-toolbar__divider" aria-hidden="true" />;
}

export function EditorToolbar({
  editor,
  editorMode,
  bodyFieldId,
  latestImagePath,
  imageAlt,
  posts,
  editingPath,
  mediaUploadReady,
  onBodyChange,
  onModeChange,
  onSelectInternalLink,
  onImageUploadSuccess,
}: EditorToolbarProps) {
  const [internalLinkOpen, setInternalLinkOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  function runEditorAction(action: () => void) {
    if (!editor || editorMode !== "rich") {
      return;
    }

    action();
    onBodyChange(editorDocToBody(editor.getJSON()));
  }

  function insertLink() {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const href =
      window.prompt("Link URL", previousUrl || "https://")?.trim() || "";
    if (href.length === 0) {
      return;
    }

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, "");
    const linkText = selectedText.length > 0 ? selectedText : "link text";

    if (selectedText.length > 0) {
      editor.chain().focus().setLink({ href }).run();
    } else {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: linkText,
          marks: [{ type: "link", attrs: { href } }],
        })
        .run();
    }
  }

  function insertImageFromPath(path: string) {
    if (!editor || path.length === 0) {
      return;
    }

    editor.chain().focus().setImage({ src: path, alt: imageAlt, title: imageAlt }).run();
  }

  function insertAttachmentLink(publicPath: string, filename: string) {
    if (!editor) {
      return;
    }

    const label = attachmentLabel(filename);
    editor
      .chain()
      .focus()
      .insertContent({
        type: "text",
        text: label,
        marks: [{ type: "link", attrs: { href: publicPath } }],
      })
      .run();
  }

  function insertVideoLink() {
    if (!editor) {
      return;
    }

    const url = window.prompt("Video URL (YouTube, Vimeo, or direct link)", "https://")?.trim();
    if (!url || url.length === 0) {
      return;
    }

    editor
      .chain()
      .focus()
      .insertContent({
        type: "text",
        text: "Video",
        marks: [{ type: "link", attrs: { href: url } }],
      })
      .run();
  }

  function insertTable() {
    if (!editor) {
      return;
    }

    const rowsInput = window.prompt("Table rows", "3")?.trim() || "3";
    const colsInput = window.prompt("Table columns", "3")?.trim() || "3";
    const rows = Math.min(20, Math.max(1, Number.parseInt(rowsInput, 10) || 3));
    const cols = Math.min(10, Math.max(1, Number.parseInt(colsInput, 10) || 3));

    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
  }

  async function handleImageFile(file: File | null | undefined) {
    if (!file || !editor) {
      return;
    }

    setUploadError(null);
    setUploading(true);
    const result = await uploadEditorMediaFile(file);
    setUploading(false);

    if (!result.ok) {
      setUploadError(result.error);
      return;
    }

    if (result.kind !== "image") {
      setUploadError("Choose an image file for the Image button.");
      return;
    }

    insertImageFromPath(result.publicPath);
    onImageUploadSuccess?.(result.publicPath);
    onBodyChange(editorDocToBody(editor.getJSON()));
  }

  async function handleAttachmentFile(file: File | null | undefined) {
    if (!file || !editor) {
      return;
    }

    setUploadError(null);
    setUploading(true);
    const result = await uploadEditorMediaFile(file);
    setUploading(false);

    if (!result.ok) {
      setUploadError(result.error);
      return;
    }

    insertAttachmentLink(result.publicPath, result.filename);
    if (result.kind === "image") {
      onImageUploadSuccess?.(result.publicPath);
    }
    onBodyChange(editorDocToBody(editor.getJSON()));
  }

  const richDisabled = editorMode !== "rich" || !editor;
  const mediaDisabled = richDisabled || !mediaUploadReady || uploading;

  const historyGroup: ToolbarAction[] =
    editor && editorMode === "rich"
      ? [
          {
            id: "undo",
            label: "Undo",
            icon: <IconUndo />,
            isDisabled: () => !editor.can().undo(),
            action: () => editor.chain().focus().undo().run(),
          },
          {
            id: "redo",
            label: "Redo",
            icon: <IconRedo />,
            isDisabled: () => !editor.can().redo(),
            action: () => editor.chain().focus().redo().run(),
          },
        ]
      : [];

  const headingLevels = [1, 2, 3, 4, 5, 6] as const;

  const formatGroup: ToolbarAction[] =
    editor && editorMode === "rich"
      ? [
          {
            id: "bold",
            label: "Bold",
            icon: <IconBold />,
            isActive: () => editor.isActive("bold"),
            action: () => editor.chain().focus().toggleBold().run(),
          },
          {
            id: "italic",
            label: "Italic",
            icon: <IconItalic />,
            isActive: () => editor.isActive("italic"),
            action: () => editor.chain().focus().toggleItalic().run(),
          },
          {
            id: "underline",
            label: "Underline",
            icon: <IconUnderline />,
            isActive: () => editor.isActive("underline"),
            action: () => editor.chain().focus().toggleUnderline().run(),
          },
          {
            id: "strike",
            label: "Strikethrough",
            icon: <IconStrike />,
            isActive: () => editor.isActive("strike"),
            action: () => editor.chain().focus().toggleStrike().run(),
          },
          {
            id: "inline-code",
            label: "Inline code",
            icon: <IconCode />,
            isActive: () => editor.isActive("code"),
            action: () => editor.chain().focus().toggleCode().run(),
          },
          {
            id: "subscript",
            label: "Subscript",
            icon: <IconSubscript />,
            isActive: () => editor.isActive("subscript"),
            action: () => editor.chain().focus().toggleSubscript().run(),
          },
          {
            id: "superscript",
            label: "Superscript",
            icon: <IconSuperscript />,
            isActive: () => editor.isActive("superscript"),
            action: () => editor.chain().focus().toggleSuperscript().run(),
          },
        ]
      : [];

  const currentColor =
    editor && editorMode === "rich"
      ? String(editor.getAttributes("textStyle").color ?? "#000000")
      : "#000000";

  const alignGroup: ToolbarAction[] =
    editor && editorMode === "rich"
      ? [
          {
            id: "align-left",
            label: "Align left",
            icon: <IconAlignLeft />,
            isActive: () => editor.isActive({ textAlign: "left" }),
            action: () => editor.chain().focus().setTextAlign("left").run(),
          },
          {
            id: "align-center",
            label: "Align center",
            icon: <IconAlignCenter />,
            isActive: () => editor.isActive({ textAlign: "center" }),
            action: () => editor.chain().focus().setTextAlign("center").run(),
          },
          {
            id: "align-right",
            label: "Align right",
            icon: <IconAlignRight />,
            isActive: () => editor.isActive({ textAlign: "right" }),
            action: () => editor.chain().focus().setTextAlign("right").run(),
          },
        ]
      : [];

  const blockGroup: ToolbarAction[] =
    editor && editorMode === "rich"
      ? [
          {
            id: "bullet-list",
            label: "Bullet list",
            icon: <IconListBullet />,
            isActive: () => editor.isActive("bulletList"),
            action: () => editor.chain().focus().toggleBulletList().run(),
          },
          {
            id: "ordered-list",
            label: "Numbered list",
            icon: <IconListNumbered />,
            isActive: () => editor.isActive("orderedList"),
            action: () => editor.chain().focus().toggleOrderedList().run(),
          },
          {
            id: "blockquote",
            label: "Blockquote",
            icon: <IconQuote />,
            isActive: () => editor.isActive("blockquote"),
            action: () => editor.chain().focus().toggleBlockquote().run(),
          },
          {
            id: "code-block",
            label: "Code block",
            icon: <IconCodeBlock />,
            isActive: () => editor.isActive("codeBlock"),
            action: () => editor.chain().focus().toggleCodeBlock().run(),
          },
          {
            id: "hr",
            label: "Horizontal rule",
            icon: <IconHr />,
            action: () => editor.chain().focus().setHorizontalRule().run(),
          },
        ]
      : [];

  const insertGroup: ToolbarAction[] =
    editor && editorMode === "rich"
      ? [
          {
            id: "link",
            label: "Link",
            icon: <IconLink />,
            isActive: () => editor.isActive("link"),
            action: insertLink,
          },
          {
            id: "image",
            label: "Image",
            icon: <IconImage />,
            isDisabled: () => mediaDisabled,
            action: () => {
              if (mediaUploadReady) {
                imageInputRef.current?.click();
                return;
              }

              const path =
                latestImagePath?.trim() ||
                window.prompt("Image path (public URL or repo path)", "/images/")?.trim() ||
                "";
              if (path.length > 0) {
                insertImageFromPath(path);
              }
            },
          },
          {
            id: "video",
            label: "Video",
            icon: <IconVideo />,
            action: insertVideoLink,
          },
          {
            id: "attachment",
            label: "Attachment",
            icon: <IconAttachment />,
            isDisabled: () => mediaDisabled,
            action: () => attachmentInputRef.current?.click(),
          },
          {
            id: "table",
            label: "Table",
            icon: <IconTable />,
            action: insertTable,
          },
        ]
      : [];

  function renderActionButton(button: ToolbarAction) {
    const active = button.isActive?.() ?? false;
    const disabled = richDisabled || (button.isDisabled?.() ?? false);

    return (
      <button
        key={button.id}
        type="button"
        className={
          active
            ? "editor-toolbar__button editor-toolbar__button--active"
            : "editor-toolbar__button"
        }
        aria-label={button.label}
        title={button.label}
        aria-pressed={button.isActive ? active : undefined}
        disabled={disabled}
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={() => {
          runEditorAction(button.action);
        }}
      >
        {button.icon ?? <span aria-hidden="true">{button.text}</span>}
      </button>
    );
  }

  return (
    <div className="editor-toolbar-wrap">
      <div
        className="editor-toolbar"
        role="toolbar"
        aria-label="Editor formatting"
        aria-controls={bodyFieldId}
      >
        {historyGroup.length > 0 && (
          <>
            <ToolbarGroup>{historyGroup.map(renderActionButton)}</ToolbarGroup>
            <ToolbarDivider />
          </>
        )}

        {editor && editorMode === "rich" && (
          <>
            <ToolbarGroup>
              <label className="editor-toolbar__select-wrap">
                <span className="visually-hidden">Heading level</span>
                <select
                  className="editor-toolbar__select"
                  value={(() => {
                    const active = headingLevels.find((level) =>
                      editor.isActive("heading", { level }),
                    );
                    return active !== undefined ? String(active) : "paragraph";
                  })()}
                  onChange={(event) => {
                    const value = event.target.value;
                    runEditorAction(() => {
                      if (value === "paragraph") {
                        editor.chain().focus().setParagraph().run();
                        return;
                      }

                      const level = Number.parseInt(value, 10) as 1 | 2 | 3 | 4 | 5 | 6;
                      editor.chain().focus().toggleHeading({ level }).run();
                    });
                  }}
                  onMouseDown={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <option value="paragraph">Paragraph</option>
                  {headingLevels.map((level) => (
                    <option key={level} value={level}>
                      Heading {level}
                    </option>
                  ))}
                </select>
              </label>
            </ToolbarGroup>
            <ToolbarDivider />
          </>
        )}

        {formatGroup.length > 0 && (
          <>
            <ToolbarGroup>
              {formatGroup.map(renderActionButton)}
              <label className="editor-toolbar__color" title="Text color">
                <span className="visually-hidden">Text color</span>
                <input
                  type="color"
                  value={currentColor.startsWith("#") ? currentColor : "#000000"}
                  disabled={richDisabled}
                  onMouseDown={(event) => {
                    event.stopPropagation();
                  }}
                  onChange={(event) => {
                    runEditorAction(() => {
                      editor?.chain().focus().setColor(event.target.value).run();
                    });
                  }}
                />
              </label>
            </ToolbarGroup>
            <ToolbarDivider />
          </>
        )}

        {alignGroup.length > 0 && (
          <>
            <ToolbarGroup>{alignGroup.map(renderActionButton)}</ToolbarGroup>
            <ToolbarDivider />
          </>
        )}

        {blockGroup.length > 0 && (
          <>
            <ToolbarGroup>{blockGroup.map(renderActionButton)}</ToolbarGroup>
            <ToolbarDivider />
          </>
        )}

        {insertGroup.length > 0 && (
          <>
            <ToolbarGroup>
              {insertGroup.map(renderActionButton)}
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
            </ToolbarGroup>
            <ToolbarDivider />
          </>
        )}

        <div className="editor-toolbar__spacer" />

        <ToolbarGroup>
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
        </ToolbarGroup>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept={EDITOR_IMAGE_ACCEPT}
        className="visually-hidden"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          void handleImageFile(file);
          event.target.value = "";
        }}
      />
      <input
        ref={attachmentInputRef}
        type="file"
        accept={EDITOR_ATTACHMENT_ACCEPT}
        className="visually-hidden"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          void handleAttachmentFile(file);
          event.target.value = "";
        }}
      />

      {uploadError && (
        <p className="editor-toolbar__error" role="alert">
          {uploadError}
        </p>
      )}

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
