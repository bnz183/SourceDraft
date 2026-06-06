export type FrontmatterState = {
  title: string;
  slug: string;
  description: string;
  pubDate: string;
  updatedDate: string;
  category: string;
  tags: string;
  draft: boolean;
  heroImage: string;
};

type FrontmatterInspectorProps = {
  values: FrontmatterState;
  onChange: (field: keyof FrontmatterState, value: string | boolean) => void;
};

export function FrontmatterInspector({
  values,
  onChange,
}: FrontmatterInspectorProps) {
  return (
    <aside className="panel frontmatter-inspector">
      <div className="panel__header">
        <h2 className="panel__title">Frontmatter</h2>
        <p className="panel__meta">Universal article schema</p>
      </div>

      <div className="frontmatter-inspector__grid">
        <label className="field">
          <span className="field__label">Title</span>
          <input
            className="field__input"
            type="text"
            value={values.title}
            onChange={(event) => onChange("title", event.target.value)}
          />
        </label>

        <label className="field">
          <span className="field__label">Slug</span>
          <input
            className="field__input field__input--mono"
            type="text"
            value={values.slug}
            onChange={(event) => onChange("slug", event.target.value)}
          />
        </label>

        <label className="field field--full">
          <span className="field__label">Description</span>
          <textarea
            className="field__textarea"
            value={values.description}
            onChange={(event) => onChange("description", event.target.value)}
            rows={3}
          />
        </label>

        <label className="field">
          <span className="field__label">Publication date</span>
          <input
            className="field__input field__input--mono"
            type="date"
            value={values.pubDate}
            onChange={(event) => onChange("pubDate", event.target.value)}
          />
        </label>

        <label className="field">
          <span className="field__label">Updated date</span>
          <input
            className="field__input field__input--mono"
            type="date"
            value={values.updatedDate}
            onChange={(event) => onChange("updatedDate", event.target.value)}
          />
        </label>

        <label className="field">
          <span className="field__label">Category</span>
          <input
            className="field__input"
            type="text"
            value={values.category}
            onChange={(event) => onChange("category", event.target.value)}
          />
        </label>

        <label className="field">
          <span className="field__label">Tags</span>
          <input
            className="field__input field__input--mono"
            type="text"
            value={values.tags}
            onChange={(event) => onChange("tags", event.target.value)}
            placeholder="comma-separated"
          />
        </label>

        <label className="field">
          <span className="field__label">Hero image</span>
          <input
            className="field__input field__input--mono"
            type="text"
            value={values.heroImage}
            onChange={(event) => onChange("heroImage", event.target.value)}
            placeholder="/images/..."
          />
        </label>

        <label className="field field--checkbox">
          <input
            type="checkbox"
            checked={values.draft}
            onChange={(event) => onChange("draft", event.target.checked)}
          />
          <span className="field__label">Draft</span>
        </label>
      </div>
    </aside>
  );
}
