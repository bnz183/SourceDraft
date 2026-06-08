import type { ValidationIssue } from "@sourcedraft/core";
import type { ArticleFormState } from "../lib/articleForm";
import { ContentQualityPanel } from "./ContentQualityPanel";
import { MediaDropzone } from "./MediaDropzone";

type PostDetailsPanelProps = {
  values: ArticleFormState;
  categories: string[];
  githubReady: boolean;
  fieldErrors: Record<string, string>;
  slugAuto: boolean;
  valid: boolean;
  issues: ValidationIssue[];
  outputPath: string | null;
  onChange: (field: keyof ArticleFormState, value: string | boolean) => void;
  onSlugManualEdit: () => void;
  onSlugResync: () => void;
  onUseHeroImage: (publicPath: string) => void;
  onInsertImage: (publicPath: string) => void;
  onUploadSuccess?: (publicPath: string) => void;
};

export function PostDetailsPanel({
  values,
  categories,
  githubReady,
  fieldErrors,
  slugAuto,
  valid,
  issues,
  outputPath,
  onChange,
  onSlugManualEdit,
  onSlugResync,
  onUseHeroImage,
  onInsertImage,
  onUploadSuccess,
}: PostDetailsPanelProps) {
  function fieldClass(field: string): string {
    return fieldErrors[field]
      ? "field__input field__input--error"
      : "field__input";
  }

  return (
    <aside className="post-details" aria-labelledby="post-details-title">
      <div className="post-details__header">
        <h2 className="post-details__title" id="post-details-title">
          Post details
        </h2>
        <p className="post-details__meta">Slug, dates, category, and cover</p>
      </div>

      <div className="post-details__body">
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
              title={slugAuto ? "Already synced from title" : "Sync slug from title"}
            >
              Sync
            </button>
          </div>
          <span className="field__hint">
            {slugAuto ? "Generated from title" : "Edited manually"}
          </span>
          {fieldErrors.slug && (
            <span className="field__error" role="alert">
              {fieldErrors.slug}
            </span>
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
            <span className="field__error" role="alert">
              {fieldErrors.category}
            </span>
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
            <span className="field__error" role="alert">
              {fieldErrors.tags}
            </span>
          )}
        </label>

        <label className="field">
          <span className="field__label">Publish date</span>
          <input
            className={`${fieldClass("pubDate")} field__input--mono`}
            type="date"
            value={values.pubDate}
            onChange={(event) => onChange("pubDate", event.target.value)}
          />
          {fieldErrors.pubDate && (
            <span className="field__error" role="alert">
              {fieldErrors.pubDate}
            </span>
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
          <span className="field__hint">Optional</span>
          {fieldErrors.updatedDate && (
            <span className="field__error" role="alert">
              {fieldErrors.updatedDate}
            </span>
          )}
        </label>

        <label className="field field--checkbox">
          <input
            type="checkbox"
            checked={values.draft}
            onChange={(event) => onChange("draft", event.target.checked)}
          />
          <span className="field__label">Save as draft</span>
        </label>

        <div className="field field--full">
          <label className="field" htmlFor="cover-image-path">
            <span className="field__label">Cover image</span>
            <input
              id="cover-image-path"
              className={`${fieldClass("heroImage")} field__input--mono`}
              type="text"
              value={values.heroImage}
              onChange={(event) => onChange("heroImage", event.target.value)}
              placeholder="/images/your-cover.png"
              aria-describedby="cover-image-hint"
            />
            <span className="field__hint" id="cover-image-hint">
              Public URL path for your cover image
            </span>
            {fieldErrors.heroImage && (
              <span className="field__error" role="alert">
                {fieldErrors.heroImage}
              </span>
            )}
          </label>

          <MediaDropzone
            githubReady={githubReady}
            onUseAsHero={onUseHeroImage}
            onInsertIntoBody={onInsertImage}
            onUploadSuccess={onUploadSuccess}
          />
        </div>

        <div className="post-details__section" aria-live="polite">
          <span className="field__label">Output file</span>
          {outputPath ? (
            <code className="post-details__path">{outputPath}</code>
          ) : (
            <p className="post-details__path-empty">
              Complete required fields to see the file path.
            </p>
          )}
        </div>

        <ContentQualityPanel values={values} validationIssues={issues} />

        <div
          className={
            valid
              ? "post-details__validation post-details__validation--ok"
              : "post-details__validation post-details__validation--warn"
          }
          role="status"
        >
          <span className="post-details__validation-label">
            {valid ? "Ready to publish" : "Needs attention"}
          </span>
          {!valid && issues.length > 0 && (
            <ul className="post-details__issues">
              {issues.slice(0, 4).map((issue) => (
                <li key={`${issue.field}-${issue.message}`}>
                  <span className="post-details__issue-field">{issue.field}</span>
                  {issue.message}
                </li>
              ))}
              {issues.length > 4 && (
                <li className="post-details__issues-more">
                  {issues.length - 4} more issue
                  {issues.length - 4 === 1 ? "" : "s"} — see preview below
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
