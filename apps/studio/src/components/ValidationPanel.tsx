import type { ValidationIssue } from "@sourcedraft/core";

type ValidationPanelProps = {
  valid: boolean;
  issues: ValidationIssue[];
};

export function ValidationPanel({ valid, issues }: ValidationPanelProps) {
  return (
    <section className="panel validation-panel">
      <div className="panel__header">
        <h2 className="panel__title">Validation</h2>
        <p className="panel__meta">
          {valid ? "Article passes schema checks" : `${issues.length} issue(s)`}
        </p>
      </div>

      {valid ? (
        <p className="validation-panel__ok">Ready for normalization.</p>
      ) : (
        <ul className="validation-panel__issues">
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
