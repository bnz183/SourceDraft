type EditorWorkspaceProps = {
  body: string;
  onBodyChange: (body: string) => void;
};

export function EditorWorkspace({ body, onBodyChange }: EditorWorkspaceProps) {
  return (
    <section className="panel editor-workspace">
      <div className="panel__header">
        <h2 className="panel__title">Body</h2>
        <p className="panel__meta">MDX / Markdown</p>
      </div>

      <textarea
        className="editor-workspace__textarea"
        value={body}
        onChange={(event) => onBodyChange(event.target.value)}
        spellCheck={false}
        placeholder="Write Markdown or MDX content. Headings, lists, and code blocks are fine."
        aria-label="Article body"
      />
    </section>
  );
}
