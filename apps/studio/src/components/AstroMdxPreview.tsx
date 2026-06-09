import { useState } from "react";
import { getAstroMdxPath, toAstroMdx } from "@sourcedraft/adapter-astro-mdx";
import { getMarkdownPath, toMarkdown } from "@sourcedraft/adapter-markdown";
import type { Article, ValidationIssue } from "@sourcedraft/core";

type AstroMdxPreviewProps = {
  valid: boolean;
  issues: ValidationIssue[];
  article: Article | null;
  contentDir: string;
  adapter: string;
  outputPath?: string | null;
};

function previewLabel(adapter: string): string {
  return adapter === "markdown" ? "Markdown preview" : "MDX preview";
}

export function AstroMdxPreview({
  valid,
  issues,
  article,
  contentDir,
  adapter,
  outputPath,
}: AstroMdxPreviewProps) {
  const [collapsed, setCollapsed] = useState(false);

  const resolvedOutputPath =
    valid && article
      ? outputPath && outputPath.length > 0
        ? outputPath
        : adapter === "markdown"
          ? getMarkdownPath(article, { contentDir })
          : getAstroMdxPath(article, { contentDir })
      : null;

  const fileOutput =
    valid && article
      ? adapter === "markdown"
        ? toMarkdown(article)
        : toAstroMdx(article)
      : null;

  return (
    <section className="preview-panel" aria-labelledby="preview-panel-title">
      <div className="preview-panel__header">
        <div>
          <h2 className="preview-panel__title" id="preview-panel-title">
            {previewLabel(adapter)}
          </h2>
          <p className="preview-panel__meta">
            {valid
              ? "File that will be saved to GitHub"
              : "Complete post details to preview output"}
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
                <span className="preview-panel__path-label">Output file</span>
                <code>{resolvedOutputPath}</code>
              </div>
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
