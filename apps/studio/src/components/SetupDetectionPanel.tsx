import { useEffect, useState } from "react";
import {
  fetchSetupDetection,
  type SetupDetectionReport,
} from "../lib/setupDetection.js";

export function SetupDetectionPanel() {
  const [report, setReport] = useState<SetupDetectionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchSetupDetection().then((next) => {
      setReport(next);
      setLoading(false);
    });
  }, []);

  async function handleCopyConfig(): Promise<void> {
    if (!report?.suggestedConfigSnippet) {
      return;
    }

    try {
      await navigator.clipboard.writeText(report.suggestedConfigSnippet);
      setCopyStatus("Suggested config copied to clipboard.");
    } catch {
      setCopyStatus("Could not copy to clipboard.");
    }
  }

  return (
    <section className="panel setup-detection" aria-labelledby="setup-detection-title">
      <div className="panel__header">
        <h2 className="panel__title" id="setup-detection-title">
          Setup detection
        </h2>
        <p className="panel__meta">
          Scans local project files — does not write configuration automatically
        </p>
      </div>

      {loading && (
        <p className="setup-detection__loading" role="status">
          Scanning project…
        </p>
      )}

      {!loading && report === null && (
        <p className="setup-detection__error" role="alert">
          Could not run setup detection. Confirm the publish API is running.
        </p>
      )}

      {report && (
        <>
          <p className="setup-detection__root">
            Scanned: <code>{report.scannedRoot}</code>
          </p>

          {report.warnings.length > 0 && (
            <ul className="setup-detection__warnings">
              {report.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}

          {report.primary ? (
            <dl className="setup-detection__grid">
              <div>
                <dt>Framework</dt>
                <dd>{report.primary.framework}</dd>
              </div>
              <div>
                <dt>Suggested adapter</dt>
                <dd>
                  <code>{report.primary.adapter}</code>
                </dd>
              </div>
              <div>
                <dt>Content directory</dt>
                <dd>
                  <code>{report.primary.contentDir}</code>
                </dd>
              </div>
              <div>
                <dt>Media directory</dt>
                <dd>
                  <code>{report.primary.mediaDir}</code>
                </dd>
              </div>
              <div>
                <dt>Public media path</dt>
                <dd>
                  <code>{report.primary.publicMediaPath}</code>
                </dd>
              </div>
              <div>
                <dt>Default branch</dt>
                <dd>{report.primary.defaultBranch}</dd>
              </div>
              <div>
                <dt>Confidence</dt>
                <dd>{report.primary.confidence}%</dd>
              </div>
              <div className="setup-detection__explanation">
                <dt>Signals</dt>
                <dd>{report.primary.explanation}</dd>
              </div>
            </dl>
          ) : (
            <p className="setup-detection__empty" role="status">
              No supported framework detected. Use <code>pnpm setup</code> or edit{" "}
              <code>sourcedraft.config.json</code> manually.
            </p>
          )}

          {report.alternatives.length > 0 && (
            <details className="setup-detection__alternatives">
              <summary>Alternative matches ({report.alternatives.length})</summary>
              <ul>
                {report.alternatives.map((candidate) => (
                  <li key={`${candidate.adapter}-${candidate.framework}`}>
                    {candidate.framework} — {candidate.confidence}% (
                    <code>{candidate.adapter}</code>)
                  </li>
                ))}
              </ul>
            </details>
          )}

          {report.suggestedConfigSnippet && (
            <div className="setup-detection__actions">
              <button
                type="button"
                className="button button--compact"
                onClick={() => {
                  void handleCopyConfig();
                }}
                disabled={!report.safeToApply}
                title={
                  report.safeToApply
                    ? "Copy suggested sourcedraft.config.json fields"
                    : "Confidence is low or warnings are present — review before applying"
                }
              >
                Copy suggested config
              </button>
              {!report.safeToApply && (
                <p className="setup-detection__hint">
                  Review detection results before applying. Low confidence or warnings
                  require manual confirmation.
                </p>
              )}
              {copyStatus && (
                <p className="setup-detection__hint" role="status">
                  {copyStatus}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
