import { useState } from "react";
import {
  getAdapterPostPath,
  getAdapterPreviewMeta,
  getAdapterPreviewNavHint,
  isAdapterId,
  renderAdapterOutput,
} from "@sourcedraft/adapters";
import type { Article, ValidationIssue } from "@sourcedraft/core";

type AstroMdxPreviewProps = {
  valid: boolean;
  issues: ValidationIssue[];
  article: Article | null;
  contentDir: string;
  adapter: string;
  adapterOptions?: Record<string, unknown>;
  outputPath?: string | null;
};

export function AstroMdxPreview({
  valid,
  issues,
  article,
  contentDir,
  adapter,
  adapterOptions,
  outputPath,
}: AstroMdxPreviewProps) {
  const [collapsed, setCollapsed] = useState(false);
  const adapterId = isAdapterId(adapter) ? adapter : "astro-mdx";
  const previewMeta = getAdapterPreviewMeta(adapterId);

  const resolvedOutputPath =
    valid && article
      ? outputPath && outputPath.length > 0
        ? outputPath
        : getAdapterPostPath(adapterId, article, {
            contentDir,
            ...(adapterOptions !== undefined ? { adapterOptions } : {}),
          })
      : null;

  const fileOutput =
    valid && article
      ? renderAdapterOutput(adapterId, article, adapterOptions)
      : null;

  const navHint =
    valid && article && resolvedOutputPath
      ? getAdapterPreviewNavHint(
          adapterId,
          article,
          resolvedOutputPath,
          adapterOptions,
        ) ?? previewMeta.navHint
      : previewMeta.navHint;

  return (
    <section className="preview-panel" aria-labelledby="preview-panel-title">
      <div className="preview-panel__header">
        <div>
          <h2 className="preview-panel__title" id="preview-panel-title">
            {previewMeta.label}
          </h2>
          <p className="preview-panel__meta">
            {valid
              ? "See the generated article file before you send it to your blog"
              : "Complete article details to preview the generated output"}
          </p>
        </div>
        <button
          type="button"
          className="button button--compact"
          aria-expanded={!collapsed}
          aria-controls="preview-panel-content"
          onClick={() => setCollapsed((current) => !current)}
        >
          {collapsed ? "Show preview" : "Hide preview"}
        </button>
      </div>

      {!collapsed && (
        <div className="preview-panel__content" id="preview-panel-content">
          {valid && resolvedOutputPath && fileOutput ? (
            <>
              <div className="preview-panel__path">
                <span className="preview-panel__path-label">Article file</span>
                <code>{resolvedOutputPath}</code>
              </div>
              {navHint && (
                <p className="preview-panel__meta" role="note">
                  {navHint}
                </p>
              )}
              <pre className="preview-panel__code">
                <code>{fileOutput}</code>
              </pre>
            </>
          ) : (
            <div className="validation-panel">
              {issues.length === 0 ? (
                <p className="validation-panel__intro">
                  Add a title, description, dates, category, and body to continue.
                </p>
              ) : (
                <>
                  <p className="validation-panel__intro" role="status">
                    Fix these items before publishing:
                  </p>
                  <ul className="validation-panel__issues">
                    {issues.map((issue) => (
                      <li key={`${issue.field}-${issue.message}`}>
                        <span className="validation-panel__field">
                          {issue.field}
                        </span>
                        {issue.message}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
