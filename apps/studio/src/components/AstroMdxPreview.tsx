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
  return adapter === "markdown" ? "Markdown output" : "Astro MDX output";
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
    <section className="panel mdx-output">
      <div className="panel__header">
        <h2 className="panel__title">{previewLabel(adapter)}</h2>
        <p className="panel__meta">
          {valid
            ? "Preview of the file that will be committed"
            : "Fix validation issues to preview output"}
        </p>
      </div>

      {valid && resolvedOutputPath && fileOutput ? (
        <div className="mdx-output__content">
          <div className="mdx-output__path">
            <span className="mdx-output__path-label">Output path</span>
            <code>{resolvedOutputPath}</code>
          </div>
          <pre className="mdx-output__code">
            <code>{fileOutput}</code>
          </pre>
        </div>
      ) : (
        <ul className="validation-panel__issues mdx-output__issues">
          {issues.map((issue) => (
            <li key={`${issue.field}-${issue.message}`}>
              <span className="validation-panel__field">{issue.field}</span>
              {issue.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
