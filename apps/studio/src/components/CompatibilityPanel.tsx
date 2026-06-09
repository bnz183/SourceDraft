import type { SetupCompatibilityReport } from "../lib/setupHealth.js";

type CompatibilityPanelProps = {
  compatibility: SetupCompatibilityReport;
};

export function CompatibilityPanel({ compatibility }: CompatibilityPanelProps) {
  const statusLabel = compatibility.validationOk ? "Valid" : "Needs attention";
  const statusClass = compatibility.validationOk
    ? "compatibility-panel__status--ok"
    : "compatibility-panel__status--warn";

  return (
    <section
      className="panel compatibility-panel"
      aria-labelledby="compatibility-panel-title"
    >
      <div className="panel__header">
        <h2 className="panel__title" id="compatibility-panel-title">
          Compatibility &amp; status
        </h2>
        <p className="panel__meta">
          Read-only summary — secrets are never shown in the browser
        </p>
      </div>

      <dl className="compatibility-panel__grid">
        <div className="compatibility-panel__row">
          <dt>Adapter</dt>
          <dd>{compatibility.adapter}</dd>
        </div>
        <div className="compatibility-panel__row">
          <dt>Publisher</dt>
          <dd>{compatibility.publisher}</dd>
        </div>
        <div className="compatibility-panel__row">
          <dt>Media provider</dt>
          <dd>{compatibility.mediaProvider}</dd>
        </div>
        <div className="compatibility-panel__row">
          <dt>Validation</dt>
          <dd>
            <span
              className={`compatibility-panel__status ${statusClass}`}
            >
              {statusLabel}
            </span>
          </dd>
        </div>
      </dl>

      {compatibility.missingEnvVars.length > 0 && (
        <div className="notice notice--warning compatibility-panel__notice" role="status">
          <p className="notice__title">Missing environment variables</p>
          <p className="notice__body">
            Set these in <code>.env</code> on the server (or run{" "}
            <code>pnpm setup</code>):{" "}
            {compatibility.missingEnvVars.join(", ")}
          </p>
        </div>
      )}

      {compatibility.warnings.length > 0 && (
        <ul className="compatibility-panel__warnings">
          {compatibility.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
