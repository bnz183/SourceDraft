import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Underline from "@tiptap/extension-underline";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { PostSummary } from "../lib/posts.js";
import {
  postToInternalLinkTarget,
} from "../lib/internalLinks.js";
import { bodyToEditorDoc, editorDocToBody } from "./markdownRoundtrip.js";
import { MdxRawBlock } from "./mdxRawBlockExtension.js";
import {
  createSlashCommandsExtension,
  type SlashCommandId,
  type SlashCommandItem,
} from "./slashCommands.js";
import { SlashCommandMenu } from "./SlashCommandMenu.js";
import { EditorToolbar, type LatestMediaUpload } from "./EditorToolbar.js";
import {
  EditorInsertDialog,
  type EditorInsertValues,
} from "./EditorInsertDialog.js";
import { fileLabelFromPath, normalizeUrl } from "./editorInsert.js";

export type { LatestMediaUpload };

type DialogState = {
  kind: "link" | "image" | "file";
  initialUrl: string;
  initialText: string;
  initialAlt: string;
  showTextField: boolean;
  allowRemove: boolean;
};

type SourceDraftEditorProps = {
  body: string;
  latestImagePath: string | null;
  latestUpload: LatestMediaUpload | null;
  imageAlt: string;
  mediaUploadAvailable: boolean;
  posts: PostSummary[];
  editingPath: string | null;
  fieldError?: string;
  onBodyChange: (body: string) => void;
  onEditorReady?: (editor: Editor | null) => void;
  onEditorModeChange?: (mode: "rich" | "source") => void;
  sourceTextareaRef?: RefObject<HTMLTextAreaElement | null>;
};

type SlashMenuState = {
  items: SlashCommandItem[];
  selectedIndex: number;
  clientRect: (() => DOMRect | null) | null;
};

export function SourceDraftEditor({
  body,
  latestImagePath,
  latestUpload,
  imageAlt,
  mediaUploadAvailable,
  posts,
  editingPath,
  fieldError,
  onBodyChange,
  onEditorReady,
  onEditorModeChange,
  sourceTextareaRef,
}: SourceDraftEditorProps) {
  const bodyFieldId = useId();
  const [editorMode, setEditorMode] = useState<"rich" | "source">("rich");
  const [sourceValue, setSourceValue] = useState(body);
  const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const bodyVersion = useRef(body);
  const slashHandlerRef = useRef<(command: SlashCommandId) => void>(() => {});

  // Build the slash extension once and dispatch to the latest handler through
  // slashHandlerRef, so the Tiptap extension is not rebuilt on every render.
  // The React Compiler flags this intentional latest-ref pattern.
  /* eslint-disable react-hooks/preserve-manual-memoization, react-hooks/refs */
  const slashExtension = useMemo(
    () =>
      createSlashCommandsExtension(
        {
          onCommand: (command) => {
            slashHandlerRef.current(command);
          },
        },
        () => ({
          onStart: (props) => {
            setSlashMenu({
              items: props.items,
              selectedIndex: 0,
              clientRect: props.clientRect ?? null,
            });
          },
          onUpdate: (props) => {
            setSlashMenu({
              items: props.items,
              selectedIndex: 0,
              clientRect: props.clientRect ?? null,
            });
          },
          onKeyDown: (props) => {
            if (props.event.key === "Escape") {
              setSlashMenu(null);
              return true;
            }
            return false;
          },
          onExit: () => {
            setSlashMenu(null);
          },
        }),
      ),
    [],
  );
  /* eslint-enable react-hooks/preserve-manual-memoization, react-hooks/refs */

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        horizontalRule: false,
      }),
      HorizontalRule,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: false,
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder: "Start writing your article… Type / for commands.",
      }),
      MdxRawBlock,
      slashExtension,
    ],
    content: bodyToEditorDoc(body),
    editorProps: {
      attributes: {
        id: bodyFieldId,
        class: fieldError
          ? "writing-canvas__body sourcedraft-editor sourcedraft-editor--error"
          : "writing-canvas__body sourcedraft-editor",
        "data-testid": "post-body-editor",
        spellcheck: "true",
        "aria-invalid": fieldError ? "true" : "false",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const nextBody = editorDocToBody(currentEditor.getJSON());
      bodyVersion.current = nextBody;
      onBodyChange(nextBody);
    },
  });

  const syncBodyFromEditor = useCallback(
    (currentEditor: Editor) => {
      const nextBody = editorDocToBody(currentEditor.getJSON());
      bodyVersion.current = nextBody;
      onBodyChange(nextBody);
    },
    [onBodyChange],
  );

  const insertInternalLink = useCallback(
    (post: PostSummary) => {
      if (!editor) {
        return;
      }

      const target = postToInternalLinkTarget(post);
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: target.title,
          marks: [{ type: "link", attrs: { href: `/post/${target.slug}/` } }],
        })
        .run();
      syncBodyFromEditor(editor);
    },
    [editor, syncBodyFromEditor],
  );

  const openLinkDialog = useCallback(() => {
    if (!editor) {
      return;
    }
    const linkActive = editor.isActive("link");
    const previousHref =
      (editor.getAttributes("link").href as string | undefined) ?? "";
    const selectionEmpty = editor.state.selection.empty;
    setDialog({
      kind: "link",
      initialUrl: previousHref,
      initialText: "",
      initialAlt: "",
      showTextField: selectionEmpty && !linkActive,
      allowRemove: linkActive,
    });
  }, [editor]);

  const openImageDialog = useCallback(() => {
    if (!editor) {
      return;
    }
    const defaultSrc =
      latestImagePath?.trim() ||
      (latestUpload?.kind === "image" ? latestUpload.publicPath : "") ||
      "";
    setDialog({
      kind: "image",
      initialUrl: defaultSrc,
      initialText: "",
      initialAlt: imageAlt,
      showTextField: false,
      allowRemove: false,
    });
  }, [editor, imageAlt, latestImagePath, latestUpload]);

  const openFileDialog = useCallback(() => {
    if (!editor) {
      return;
    }
    const defaultPath =
      latestUpload?.kind === "pdf" ? latestUpload.publicPath : "/files/";
    setDialog({
      kind: "file",
      initialUrl: defaultPath,
      initialText: "",
      initialAlt: "",
      showTextField: false,
      allowRemove: false,
    });
  }, [editor, latestUpload]);

  const handleDialogSubmit = useCallback(
    (values: EditorInsertValues) => {
      if (!editor || !dialog) {
        return;
      }

      if (dialog.kind === "link") {
        const href = normalizeUrl(values.url);
        if (href.length === 0) {
          editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else if (dialog.showTextField) {
          const text = values.text?.trim() || href;
          editor
            .chain()
            .focus()
            .insertContent({
              type: "text",
              text,
              marks: [{ type: "link", attrs: { href } }],
            })
            .run();
        } else {
          editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
        }
      } else if (dialog.kind === "image") {
        const src = normalizeUrl(values.url);
        if (src.length > 0) {
          const alt = values.alt?.trim() || imageAlt;
          editor.chain().focus().setImage({ src, alt, title: alt }).run();
        }
      } else {
        const path = values.url.trim();
        if (path.length > 0) {
          const label = fileLabelFromPath(path);
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
      }

      syncBodyFromEditor(editor);
      setDialog(null);
    },
    [dialog, editor, imageAlt, syncBodyFromEditor],
  );

  const handleSlashCommand = useCallback(
    (command: SlashCommandId) => {
      if (!editor) {
        return;
      }

      switch (command) {
        case "h1":
          editor.chain().focus().toggleHeading({ level: 1 }).run();
          break;
        case "h2":
          editor.chain().focus().toggleHeading({ level: 2 }).run();
          break;
        case "h3":
          editor.chain().focus().toggleHeading({ level: 3 }).run();
          break;
        case "quote":
          editor.chain().focus().toggleBlockquote().run();
          break;
        case "code":
          editor.chain().focus().toggleCodeBlock().run();
          break;
        case "hr":
          editor.chain().focus().setHorizontalRule().run();
          break;
        case "link": {
          setSlashMenu(null);
          openLinkDialog();
          return;
        }
        case "image": {
          setSlashMenu(null);
          openImageDialog();
          return;
        }
        case "internal": {
          const firstPost = posts[0];
          if (firstPost) {
            insertInternalLink(firstPost);
          }
          break;
        }
        case "callout":
          editor
            .chain()
            .focus()
            .insertContent({
              type: "blockquote",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Note:",
                      marks: [{ type: "bold" }],
                    },
                    { type: "text", text: " Callout text" },
                  ],
                },
              ],
            })
            .run();
          break;
      }

      syncBodyFromEditor(editor);
      setSlashMenu(null);
    },
    [editor, insertInternalLink, openImageDialog, openLinkDialog, posts, syncBodyFromEditor],
  );

  useEffect(() => {
    slashHandlerRef.current = handleSlashCommand;
  }, [handleSlashCommand]);

  useEffect(() => {
    onEditorReady?.(editor);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (body === bodyVersion.current) {
      return;
    }

    bodyVersion.current = body;
    setSourceValue(body);

    if (editor && editorMode === "rich") {
      editor.commands.setContent(bodyToEditorDoc(body), { emitUpdate: false });
    }
  }, [body, editor, editorMode]);

  function switchMode(mode: "rich" | "source") {
    if (mode === editorMode) {
      return;
    }

    if (mode === "source") {
      setSourceValue(bodyVersion.current);
      setEditorMode("source");
      onEditorModeChange?.("source");
      return;
    }

    if (editor) {
      editor.commands.setContent(bodyToEditorDoc(sourceValue), { emitUpdate: false });
      syncBodyFromEditor(editor);
    }

    setEditorMode("rich");
    onEditorModeChange?.("rich");
  }

  const slashRect = slashMenu?.clientRect?.() ?? null;

  return (
    <div className="sourcedraft-editor-wrap">
      <EditorToolbar
        editor={editor}
        editorMode={editorMode}
        bodyFieldId={bodyFieldId}
        mediaUploadAvailable={mediaUploadAvailable}
        posts={posts}
        editingPath={editingPath}
        onBodyChange={onBodyChange}
        onModeChange={switchMode}
        onSelectInternalLink={insertInternalLink}
        onRequestLink={openLinkDialog}
        onRequestImage={openImageDialog}
        onRequestFile={openFileDialog}
      />

      {editorMode === "rich" ? (
        <div className="writing-canvas__body-field sourcedraft-editor__surface">
          <EditorContent editor={editor} />
          {slashMenu && slashRect && (
            <div
              className="slash-command-menu-wrap"
              style={{
                top: slashRect.bottom + window.scrollY + 4,
                left: slashRect.left + window.scrollX,
              }}
            >
              <SlashCommandMenu
                items={slashMenu.items}
                selectedIndex={slashMenu.selectedIndex}
                onSelect={(item) => {
                  handleSlashCommand(item.id);
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <label className="writing-canvas__body-field">
          <span className="visually-hidden">Article body source</span>
          <textarea
            ref={sourceTextareaRef}
            id={bodyFieldId}
            className={
              fieldError
                ? "writing-canvas__body writing-canvas__body--source writing-canvas__body--error"
                : "writing-canvas__body writing-canvas__body--source"
            }
            value={sourceValue}
            data-testid="post-body-source"
            spellCheck={true}
            aria-invalid={fieldError ? true : undefined}
            onChange={(event) => {
              const next = event.target.value;
              setSourceValue(next);
              bodyVersion.current = next;
              onBodyChange(next);
            }}
          />
        </label>
      )}

      {fieldError && (
        <p className="writing-canvas__body-error field__error" role="alert">
          {fieldError}
        </p>
      )}

      {dialog && (
        <EditorInsertDialog
          kind={dialog.kind}
          initialUrl={dialog.initialUrl}
          initialText={dialog.initialText}
          initialAlt={dialog.initialAlt}
          showTextField={dialog.showTextField}
          allowRemove={dialog.allowRemove}
          onSubmit={handleDialogSubmit}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
