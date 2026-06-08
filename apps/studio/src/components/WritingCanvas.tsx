type WritingCanvasProps = {
  title: string;
  description: string;
  body: string;
  editingPath: string | null;
  draft: boolean;
  fieldErrors: Record<string, string>;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onBodyChange: (body: string) => void;
};

export function WritingCanvas({
  title,
  description,
  body,
  editingPath,
  draft,
  fieldErrors,
  onTitleChange,
  onDescriptionChange,
  onBodyChange,
}: WritingCanvasProps) {
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
          aria-invalid={fieldErrors.description ? true : undefined}
        />
        {fieldErrors.description && (
          <span className="field__error" role="alert">
            {fieldErrors.description}
          </span>
        )}
      </label>

      <div className="writing-canvas__page">
        <div
          className="editor-toolbar"
          role="toolbar"
          aria-label="Formatting"
          aria-disabled="true"
        >
          <p className="editor-toolbar__note">
            Write Markdown in the editor below. A formatting toolbar is planned
            for a future release.
          </p>
        </div>

        <label className="writing-canvas__body-field">
          <span className="visually-hidden">Article body</span>
          <textarea
            className={
              fieldErrors.body
                ? "writing-canvas__body writing-canvas__body--error"
                : "writing-canvas__body"
            }
            value={body}
            onChange={(event) => onBodyChange(event.target.value)}
            spellCheck={true}
            placeholder="Start writing your article…"
            aria-invalid={fieldErrors.body ? true : undefined}
          />
        </label>
        {fieldErrors.body && (
          <p className="writing-canvas__body-error field__error" role="alert">
            {fieldErrors.body}
          </p>
        )}
      </div>
    </div>
  );
}
