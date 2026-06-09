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
    <section className="panel mdx-output" aria-labelledby="preview-panel-title">
      <div className="panel__header">
        <h2 className="panel__title" id="preview-panel-title">
          {previewLabel(adapter)}
        </h2>
        <p className="panel__meta">
          {valid
            ? "Review the file that will be saved to GitHub"
            : "Complete post details and body to preview"}
        </p>
      </div>

      {valid && resolvedOutputPath && fileOutput ? (
        <div className="mdx-output__content">
          <div className="mdx-output__path">
            <span className="mdx-output__path-label">Output file</span>
            <code>{resolvedOutputPath}</code>
          </div>
          <pre className="mdx-output__code">
            <code>{fileOutput}</code>
          </pre>
        </div>
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
              <ul className="validation-panel__issues mdx-output__issues">
                {issues.map((issue) => (
                  <li key={`${issue.field}-${issue.message}`}>
                    <span className="validation-panel__field">{issue.field}</span>
                    {issue.message}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  );
}
