import { useEffect, useId, useRef, useState } from "react";
import { hasUrl } from "./editorInsert.js";

export type EditorInsertDialogKind = "link" | "image" | "file";

export type EditorInsertValues = {
  url: string;
  text?: string;
  alt?: string;
};

type EditorInsertDialogProps = {
  kind: EditorInsertDialogKind;
  initialUrl?: string;
  initialText?: string;
  initialAlt?: string;
  /** Show a "Link text" field (used when there is no text selection). */
  showTextField?: boolean;
  /** Allow submitting an empty URL to remove an existing link. */
  allowRemove?: boolean;
  onSubmit: (values: EditorInsertValues) => void;
  onClose: () => void;
};

const COPY: Record<
  EditorInsertDialogKind,
  { title: string; urlLabel: string; urlPlaceholder: string; submit: string }
> = {
  link: {
    title: "Insert link",
    urlLabel: "Link URL",
    urlPlaceholder: "https://example.com",
    submit: "Insert link",
  },
  image: {
    title: "Insert image",
    urlLabel: "Image path or URL",
    urlPlaceholder: "/images/photo.jpg",
    submit: "Insert image",
  },
  file: {
    title: "Insert file link",
    urlLabel: "File path or URL",
    urlPlaceholder: "/files/document.pdf",
    submit: "Insert file link",
  },
};

export function EditorInsertDialog({
  kind,
  initialUrl = "",
  initialText = "",
  initialAlt = "",
  showTextField = false,
  allowRemove = false,
  onSubmit,
  onClose,
}: EditorInsertDialogProps) {
  const titleId = useId();
  const urlId = useId();
  const textId = useId();
  const altId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const [alt, setAlt] = useState(initialAlt);

  const copy = COPY[kind];
  const canSubmit = hasUrl(url) || (allowRemove && url.trim().length === 0);

  useEffect(() => {
    firstFieldRef.current?.focus();
    firstFieldRef.current?.select();
  }, []);

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }
    onSubmit({
      url: url.trim(),
      ...(showTextField ? { text: text.trim() } : {}),
      ...(kind === "image" ? { alt: alt.trim() } : {}),
    });
  }

  return (
    <div
      className="editor-dialog-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="editor-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onClose();
          }
        }}
      >
        <div className="editor-dialog__header">
          <h2 className="editor-dialog__title" id={titleId}>
            {copy.title}
          </h2>
          <button
            type="button"
            className="button button--compact"
            aria-label="Cancel"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>

        <label className="editor-dialog__field" htmlFor={urlId}>
          <span className="editor-dialog__label">{copy.urlLabel}</span>
          <input
            ref={firstFieldRef}
            id={urlId}
            className="editor-dialog__input"
            type="text"
            value={url}
            placeholder={copy.urlPlaceholder}
            spellCheck={false}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSubmit();
              }
            }}
          />
        </label>

        {showTextField && (
          <label className="editor-dialog__field" htmlFor={textId}>
            <span className="editor-dialog__label">Link text</span>
            <input
              id={textId}
              className="editor-dialog__input"
              type="text"
              value={text}
              placeholder="Text to display"
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </label>
        )}

        {kind === "image" && (
          <label className="editor-dialog__field" htmlFor={altId}>
            <span className="editor-dialog__label">Alt text (for accessibility)</span>
            <input
              id={altId}
              className="editor-dialog__input"
              type="text"
              value={alt}
              placeholder="Describe the image"
              onChange={(event) => setAlt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </label>
        )}

        <div className="editor-dialog__actions">
          {allowRemove && (
            <button
              type="button"
              className="button button--compact editor-dialog__remove"
              onClick={() => onSubmit({ url: "" })}
            >
              Remove link
            </button>
          )}
          <button
            type="button"
            className="button button--primary"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {copy.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
