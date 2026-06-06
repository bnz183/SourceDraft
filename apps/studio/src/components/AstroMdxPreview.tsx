import { getAstroMdxPath, toAstroMdx } from "@sourcedraft/adapter-astro-mdx";
import type { Article, ValidationIssue } from "@sourcedraft/core";
import { DEFAULT_CONTENT_DIR } from "../lib/adapterConfig";

type AstroMdxPreviewProps = {
  valid: boolean;
  issues: ValidationIssue[];
  article: Article | null;
};

export function AstroMdxPreview({
  valid,
  issues,
  article,
}: AstroMdxPreviewProps) {
  const outputPath =
    valid && article
      ? getAstroMdxPath(article, { contentDir: DEFAULT_CONTENT_DIR })
      : null;
  const mdxOutput = valid && article ? toAstroMdx(article) : null;

  return (
    <section className="panel mdx-output">
      <div className="panel__header">
        <h2 className="panel__title">Astro MDX output</h2>
        <p className="panel__meta">
          {valid ? "@sourcedraft/adapter-astro-mdx" : "Blocked by validation"}
        </p>
      </div>

      {valid && outputPath && mdxOutput ? (
        <div className="mdx-output__content">
          <div className="mdx-output__path">
            <span className="mdx-output__path-label">Output path</span>
            <code>{outputPath}</code>
          </div>
          <pre className="mdx-output__code">
            <code>{mdxOutput}</code>
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
