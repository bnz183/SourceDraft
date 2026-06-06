import type { ArticleFormState } from "../lib/articleForm";

type FrontmatterInspectorProps = {
  values: ArticleFormState;
  categories: string[];
  fieldErrors: Record<string, string>;
  slugAuto: boolean;
  onChange: (field: keyof ArticleFormState, value: string | boolean) => void;
  onSlugManualEdit: () => void;
  onSlugResync: () => void;
};

export function FrontmatterInspector({
  values,
  categories,
  fieldErrors,
  slugAuto,
  onChange,
  onSlugManualEdit,
  onSlugResync,
}: FrontmatterInspectorProps) {
  function fieldClass(field: string): string {
    return fieldErrors[field]
      ? "field__input field__input--error"
      : "field__input";
  }

  return (
    <aside className="panel frontmatter-inspector">
      <div className="panel__header">
        <h2 className="panel__title">Frontmatter</h2>
        <p className="panel__meta">Title, dates, category, tags, draft</p>
      </div>

      <div className="frontmatter-inspector__grid">
        <label className="field field--full">
          <span className="field__label">Title</span>
          <input
            className={fieldClass("title")}
            type="text"
            value={values.title}
            onChange={(event) => onChange("title", event.target.value)}
          />
          {fieldErrors.title && (
            <span className="field__error">{fieldErrors.title}</span>
          )}
        </label>

        <label className="field field--full">
          <span className="field__label">Slug</span>
          <div className="field__slug-row">
            <input
              className={`${fieldClass("slug")} field__input--mono`}
              type="text"
              value={values.slug}
              onChange={(event) => {
                onSlugManualEdit();
                onChange("slug", event.target.value);
              }}
            />
            <button
              type="button"
              className="button button--compact"
              onClick={onSlugResync}
              disabled={slugAuto}
            >
              Sync
            </button>
          </div>
          <span className="field__hint">
            {slugAuto ? "Generated from title" : "Manual slug"}
          </span>
          {fieldErrors.slug && (
            <span className="field__error">{fieldErrors.slug}</span>
          )}
        </label>

        <label className="field field--full">
          <span className="field__label">Description</span>
          <textarea
            className={
              fieldErrors.description
                ? "field__textarea field__input--error"
                : "field__textarea"
            }
            value={values.description}
            onChange={(event) => onChange("description", event.target.value)}
            rows={3}
          />
          {fieldErrors.description && (
            <span className="field__error">{fieldErrors.description}</span>
          )}
        </label>

        <label className="field">
          <span className="field__label">Publication date</span>
          <input
            className={`${fieldClass("pubDate")} field__input--mono`}
            type="date"
            value={values.pubDate}
            onChange={(event) => onChange("pubDate", event.target.value)}
          />
          {fieldErrors.pubDate && (
            <span className="field__error">{fieldErrors.pubDate}</span>
          )}
        </label>

        <label className="field">
          <span className="field__label">Updated date</span>
          <input
            className={`${fieldClass("updatedDate")} field__input--mono`}
            type="date"
            value={values.updatedDate}
            onChange={(event) => onChange("updatedDate", event.target.value)}
          />
          {fieldErrors.updatedDate && (
            <span className="field__error">{fieldErrors.updatedDate}</span>
          )}
        </label>

        <label className="field">
          <span className="field__label">Category</span>
          <select
            className={
              fieldErrors.category
                ? "field__input field__input--error"
                : "field__input"
            }
            value={values.category}
            onChange={(event) => onChange("category", event.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {fieldErrors.category && (
            <span className="field__error">{fieldErrors.category}</span>
          )}
        </label>

        <label className="field">
          <span className="field__label">Tags</span>
          <input
            className={`${fieldClass("tags")} field__input--mono`}
            type="text"
            value={values.tags}
            onChange={(event) => onChange("tags", event.target.value)}
            placeholder="comma-separated"
          />
          {fieldErrors.tags && (
            <span className="field__error">{fieldErrors.tags}</span>
          )}
        </label>

        <label className="field">
          <span className="field__label">Hero image</span>
          <input
            className={`${fieldClass("heroImage")} field__input--mono`}
            type="text"
            value={values.heroImage}
            onChange={(event) => onChange("heroImage", event.target.value)}
            placeholder="/images/..."
          />
          {fieldErrors.heroImage && (
            <span className="field__error">{fieldErrors.heroImage}</span>
          )}
        </label>

        <label className="field field--checkbox">
          <input
            type="checkbox"
            checked={values.draft}
            onChange={(event) => onChange("draft", event.target.checked)}
          />
          <span className="field__label">Draft</span>
        </label>
        {fieldErrors.draft && (
          <span className="field__error field__error--inline">{fieldErrors.draft}</span>
        )}
      </div>
    </aside>
  );
}
