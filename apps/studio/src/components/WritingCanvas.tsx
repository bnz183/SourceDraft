import { useCallback, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import type { PostSummary } from "../lib/posts";
import { DocumentOutline } from "./DocumentOutline";
import { SourceDraftEditor } from "../editor/SourceDraftEditor";

type WritingCanvasProps = {
  title: string;
  description: string;
  body: string;
  editingPath: string | null;
  draft: boolean;
  latestImagePath: string | null;
  posts: PostSummary[];
  mediaUploadReady: boolean;
  fieldErrors: Record<string, string>;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onBodyChange: (body: string) => void;
  onImageUploadSuccess?: (publicPath: string) => void;
};

export function WritingCanvas({
  title,
  description,
  body,
  editingPath,
  draft,
  latestImagePath,
  posts,
  mediaUploadReady,
  fieldErrors,
  onTitleChange,
  onDescriptionChange,
  onBodyChange,
  onImageUploadSuccess,
}: WritingCanvasProps) {
  const editorRef = useRef<Editor | null>(null);
  const sourceTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [editorMode, setEditorMode] = useState<"rich" | "source">("rich");

  const handleEditorReady = useCallback((editor: Editor | null) => {
    editorRef.current = editor;
  }, []);

  const scrollToOffset = useCallback(
    (offset: number) => {
      if (editorMode === "source") {
        const textarea = sourceTextareaRef.current;
        if (!textarea) {
          return;
        }

        textarea.focus();
        textarea.setSelectionRange(offset, offset);
        const textBefore = textarea.value.slice(0, offset);
        const lineCount = textBefore.length === 0 ? 1 : textBefore.split("\n").length;
        const styles = window.getComputedStyle(textarea);
        const lineHeight = Number.parseFloat(styles.lineHeight) || 28;
        textarea.scrollTop = Math.max(0, (lineCount - 1) * lineHeight - textarea.clientHeight / 3);
        return;
      }

      const editor = editorRef.current;
      if (!editor) {
        return;
      }

      const text = body.slice(0, offset);
      const lineCount = text.length === 0 ? 1 : text.split("\n").length;
      const editorElement = editor.view.dom;
      editor.chain().focus().run();
      editorElement.scrollTop = Math.max(
        0,
        (lineCount - 1) * 28 - editorElement.clientHeight / 3,
      );
    },
    [body, editorMode],
  );

  return (
    <div className="writing-canvas">
      {editingPath && (
        <p className="writing-canvas__status" role="status">
          Editing <code>{editingPath}</code>
          {draft ? " · Draft" : " · Live"}
        </p>
      )}

      <label className="writing-canvas__title-field">
        <span className="visually-hidden">Post title</span>
        <input
          className={
            fieldErrors.title
              ? "writing-canvas__title writing-canvas__title--error"
              : "writing-canvas__title"
          }
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Post title"
          aria-label="Post title"
          data-testid="post-title-input"
          aria-invalid={fieldErrors.title ? true : undefined}
        />
        {fieldErrors.title && (
          <span className="field__error" role="alert">
            {fieldErrors.title}
          </span>
        )}
      </label>

      <label className="writing-canvas__description-field">
        <span className="visually-hidden">Description</span>
        <input
          className={
            fieldErrors.description
              ? "writing-canvas__description writing-canvas__description--error"
              : "writing-canvas__description"
          }
          type="text"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="Short description or subtitle"
          aria-label="Description"
          data-testid="post-description-input"
          aria-invalid={fieldErrors.description ? true : undefined}
        />
        {fieldErrors.description && (
          <span className="field__error" role="alert">
            {fieldErrors.description}
          </span>
        )}
      </label>

      <div className="writing-canvas__page">
        <SourceDraftEditor
          body={body}
          latestImagePath={latestImagePath}
          imageAlt={title.trim() || "Image"}
          posts={posts}
          editingPath={editingPath}
          mediaUploadReady={mediaUploadReady}
          fieldError={fieldErrors.body}
          onBodyChange={onBodyChange}
          onEditorReady={handleEditorReady}
          onEditorModeChange={setEditorMode}
          onImageUploadSuccess={onImageUploadSuccess}
          sourceTextareaRef={sourceTextareaRef}
        />
      </div>

      <DocumentOutline body={body} onScrollToOffset={scrollToOffset} />
    </div>
  );
}
