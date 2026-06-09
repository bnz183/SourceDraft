import type { ValidationIssue } from "@sourcedraft/core";
import type { ArticleFormState } from "../lib/articleForm.js";
import { analyzeSeoFields } from "../lib/seoValidation.js";

type SeoSharingPanelProps = {
  values: ArticleFormState;
  fieldErrors: Record<string, string>;
  onChange: (field: keyof ArticleFormState, value: string | boolean) => void;
  validationIssues: ValidationIssue[];
};

export function SeoSharingPanel({
  values,
  fieldErrors,
  onChange,
  validationIssues,
}: SeoSharingPanelProps) {
  const { readingTimeMinutes, warnings } = analyzeSeoFields(values);
  const blockingFields = new Set(validationIssues.map((issue) => issue.field));

  function fieldClass(field: string): string {
    return fieldErrors[field]
      ? "field__input field__input--error"
      : "field__input";
  }

  return (
    <details className="seo-sharing">
      <summary className="seo-sharing__summary">
        <span className="seo-sharing__title">SEO / Sharing</span>
        <span className="seo-sharing__hint">Optional metadata for search and social</span>
      </summary>

      <div className="seo-sharing__body">
        <p className="seo-sharing__intro">
          Leave fields blank to fall back to the post title, description, or cover
          image. Soft warnings below do not block publishing.
        </p>

        <label className="field field--full">
          <span className="field__label">Meta title</span>
          <input
            className={`${fieldClass("metaTitle")} field__input--mono`}
            type="text"
            value={values.metaTitle}
            onChange={(event) => onChange("metaTitle", event.target.value)}
            placeholder={values.title || "Defaults to post title"}
          />
          {fieldErrors.metaTitle && (
            <span className="field__error" role="alert">
              {fieldErrors.metaTitle}
            </span>
          )}
        </label>

        <label className="field field--full">
          <span className="field__label">Meta description</span>
          <textarea
            className={`${fieldClass("metaDescription")} field__input field__input--textarea`}
            value={values.metaDescription}
            onChange={(event) => onChange("metaDescription", event.target.value)}
            placeholder={values.description || "Defaults to post description"}
            rows={3}
          />
          {fieldErrors.metaDescription && (
            <span className="field__error" role="alert">
              {fieldErrors.metaDescription}
            </span>
          )}
        </label>

        <label className="field field--full">
          <span className="field__label">Canonical URL</span>
          <input
            className={`${fieldClass("canonicalUrl")} field__input--mono`}
            type="url"
            value={values.canonicalUrl}
            onChange={(event) => onChange("canonicalUrl", event.target.value)}
            placeholder="https://example.com/post/slug"
          />
          <span className="field__hint">Full https URL when this post lives elsewhere</span>
          {fieldErrors.canonicalUrl && (
            <span className="field__error" role="alert">
              {fieldErrors.canonicalUrl}
            </span>
          )}
        </label>

        <label className="field field--full">
          <span className="field__label">Social image</span>
          <input
            className={`${fieldClass("socialImage")} field__input--mono`}
            type="text"
            value={values.socialImage}
            onChange={(event) => onChange("socialImage", event.target.value)}
            placeholder={values.heroImage || "Defaults to cover image path"}
          />
          <span className="field__hint">Open Graph / Twitter image path or URL</span>
          {fieldErrors.socialImage && (
            <span className="field__error" role="alert">
              {fieldErrors.socialImage}
            </span>
          )}
        </label>

        <label className="field field--full">
          <span className="field__label">Cover image alt text</span>
          <input
            className={`${fieldClass("coverImageAlt")} field__input--mono`}
            type="text"
            value={values.coverImageAlt}
            onChange={(event) => onChange("coverImageAlt", event.target.value)}
            placeholder="Describe the cover image for accessibility"
          />
          {fieldErrors.coverImageAlt && (
            <span className="field__error" role="alert">
              {fieldErrors.coverImageAlt}
            </span>
          )}
        </label>

        <label className="field field--full">
          <span className="field__label">Author</span>
          <input
            className={`${fieldClass("author")} field__input--mono`}
            type="text"
            value={values.author}
            onChange={(event) => onChange("author", event.target.value)}
            placeholder="Optional byline"
          />
          {fieldErrors.author && (
            <span className="field__error" role="alert">
              {fieldErrors.author}
            </span>
          )}
        </label>

        <label className="field field--checkbox">
          <input
            type="checkbox"
            checked={values.noindex}
            onChange={(event) => onChange("noindex", event.target.checked)}
          />
          <span className="field__label">Noindex (ask search engines not to index)</span>
        </label>

        <p className="seo-sharing__reading-time" role="status">
          Estimated reading time:{" "}
          {readingTimeMinutes === 0
            ? "—"
            : `${readingTimeMinutes} min (added to frontmatter on publish)`}
        </p>

        {warnings.length > 0 && (
          <ul className="seo-sharing__warnings" aria-live="polite">
            {warnings.map((warning) => (
              <li
                key={warning.id}
                className={
                  blockingFields.has(warning.field)
                    ? "seo-sharing__warning seo-sharing__warning--blocked"
                    : "seo-sharing__warning"
                }
              >
                {warning.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
