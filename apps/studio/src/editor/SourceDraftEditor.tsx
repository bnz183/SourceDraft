import { useEditor, EditorContent, type Editor } from "@tiptap/react";
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
import {
  createSlashCommandsExtension,
  type SlashCommandId,
  type SlashCommandItem,
} from "./slashCommands.js";
import { SlashCommandMenu } from "./SlashCommandMenu.js";
import { EditorToolbar } from "./EditorToolbar.js";
import { createExtensionKit } from "./extensionKit.js";

type SourceDraftEditorProps = {
  body: string;
  latestImagePath: string | null;
  imageAlt: string;
  posts: PostSummary[];
  editingPath: string | null;
  mediaUploadReady: boolean;
  fieldError?: string;
  onBodyChange: (body: string) => void;
  onEditorReady?: (editor: Editor | null) => void;
  onEditorModeChange?: (mode: "rich" | "source") => void;
  onImageUploadSuccess?: (publicPath: string) => void;
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
  imageAlt,
  posts,
  editingPath,
  mediaUploadReady,
  fieldError,
  onBodyChange,
  onEditorReady,
  onEditorModeChange,
  onImageUploadSuccess,
  sourceTextareaRef,
}: SourceDraftEditorProps) {
  const bodyFieldId = useId();
  const [editorMode, setEditorMode] = useState<"rich" | "source">("rich");
  const [sourceValue, setSourceValue] = useState(body);
  const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null);
  const bodyVersion = useRef(body);
  const slashHandlerRef = useRef<(command: SlashCommandId) => void>(() => {});

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

  const editor = useEditor({
    extensions: createExtensionKit({ slashExtension }),
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
          const href = window.prompt("Link URL", "https://")?.trim() || "https://";
          editor
            .chain()
            .focus()
            .insertContent({
              type: "text",
              text: "link text",
              marks: [{ type: "link", attrs: { href } }],
            })
            .run();
          break;
        }
        case "image": {
          const path =
            latestImagePath?.trim() ||
            window.prompt("Image path (public URL or repo path)", "/images/")?.trim() ||
            "";
          if (path.length > 0) {
            editor.chain().focus().setImage({ src: path, alt: imageAlt, title: imageAlt }).run();
          }
          break;
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
    [editor, imageAlt, insertInternalLink, latestImagePath, posts, syncBodyFromEditor],
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
        latestImagePath={latestImagePath}
        imageAlt={imageAlt}
        posts={posts}
        editingPath={editingPath}
        mediaUploadReady={mediaUploadReady}
        onBodyChange={onBodyChange}
        onModeChange={switchMode}
        onSelectInternalLink={insertInternalLink}
        onImageUploadSuccess={onImageUploadSuccess}
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
    </div>
  );
}
