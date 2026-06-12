import { useEffect, useState } from "react";
import {
  fetchSetupDetection,
  generateSetupConfig,
  type SetupDetectionReport,
} from "../lib/setupDetection.js";

export function SetupDetectionPanel() {
  const [report, setReport] = useState<SetupDetectionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [generateStatus, setGenerateStatus] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

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

  async function handleGenerateConfig(): Promise<void> {
    if (!report?.primary || report.configExists) {
      return;
    }

    setGenerating(true);
    setGenerateStatus(null);
    const result = await generateSetupConfig();
    setGenerating(false);

    if (!result.ok) {
      setGenerateStatus(result.error);
      return;
    }

    setGenerateStatus(`Created ${result.configPath}. Restart the API or reload Studio to apply.`);
    const refreshed = await fetchSetupDetection();
    setReport(refreshed);
  }

  return (
    <section className="panel setup-detection" aria-labelledby="setup-detection-title">
      <div className="panel__header">
        <h2 className="panel__title" id="setup-detection-title">
          Project onboarding
        </h2>
        <p className="panel__meta">
          Automatic detection for content folders, adapters, and frontmatter
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

          {report.onboardingMessage && (
            <p className="setup-detection__summary">{report.onboardingMessage}</p>
          )}

          {!report.detected && report.failureMessage && (
            <p className="setup-detection__error" role="alert">
              {report.failureMessage}
            </p>
          )}

          {report.warnings.length > 0 && (
            <ul className="setup-detection__warnings">
              {report.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}

          {report.primary ? (
            <>
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
                  <dt>Content root</dt>
                  <dd>
                    <code>{report.primary.contentRoot}</code>
                    {report.primary.postFileCount > 0 && (
                      <span className="setup-detection__meta">
                        {" "}
                        ({report.primary.postFileCount} post file
                        {report.primary.postFileCount === 1 ? "" : "s"})
                      </span>
                    )}
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

              {report.primary.contentRootCandidates.length > 0 && (
                <details className="setup-detection__alternatives">
                  <summary>
                    Other content folders ({report.primary.contentRootCandidates.length})
                  </summary>
                  <ul>
                    {report.primary.contentRootCandidates.map((candidate) => (
                      <li key={candidate}>
                        <code>{candidate}</code>
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              {report.primary.frontmatter && report.primary.frontmatter.fields.length > 0 && (
                <div className="setup-detection__frontmatter">
                  <h3 className="setup-detection__subtitle">Frontmatter from sample posts</h3>
                  <p className="setup-detection__hint">
                    Studio uses a universal article schema. Detected fields are mapped when you
                    edit or create posts.
                  </p>
                  <ul className="setup-detection__field-list">
                    {report.primary.frontmatter.fields.map((field) => (
                      <li key={field.key}>
                        <code>{field.key}</code>
                        {field.universalField && field.universalField !== field.key && (
                          <>
                            {" "}
                            → <code>{field.universalField}</code>
                          </>
                        )}
                        <span className="setup-detection__meta">
                          {" "}
                          ({field.frequency}/{report.primary?.frontmatter?.postsSampled})
                        </span>
                      </li>
                    ))}
                  </ul>
                  {report.primary.frontmatter.suggestedCategories.length > 0 && (
                    <p className="setup-detection__hint">
                      Suggested categories:{" "}
                      {report.primary.frontmatter.suggestedCategories.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="setup-detection__empty" role="status">
              No supported framework detected. Use <code>pnpm setup</code> or edit{" "}
              <code>sourcedraft.config.json</code> manually.
            </p>
          )}

          {report.alternatives.length > 0 && (
            <details className="setup-detection__alternatives">
              <summary>Alternative frameworks ({report.alternatives.length})</summary>
              <ul>
                {report.alternatives.map((candidate) => (
                  <li key={`${candidate.adapter}-${candidate.framework}`}>
                    {candidate.framework} — {candidate.confidence}% (
                    <code>{candidate.adapter}</code>, content{" "}
                    <code>{candidate.contentRoot}</code>)
                  </li>
                ))}
              </ul>
            </details>
          )}

          {report.configPreviewSummary && !report.configExists && (
            <pre className="setup-detection__preview">{report.configPreviewSummary}</pre>
          )}

          <div className="setup-detection__actions">
            {report.primary && !report.configExists && (
              <button
                type="button"
                className="button"
                disabled={generating}
                onClick={() => {
                  void handleGenerateConfig();
                }}
              >
                {generating ? "Generating…" : "Generate config"}
              </button>
            )}

            {report.configExists && (
              <p className="setup-detection__hint" role="status">
                <code>sourcedraft.config.json</code> already exists. Edit it manually instead of
                generating a new file.
              </p>
            )}

            {report.suggestedConfigSnippet && (
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
            )}

            {!report.safeToApply && report.primary && (
              <p className="setup-detection__hint">
                Review detection results before applying. Low confidence or warnings require manual
                confirmation.
              </p>
            )}

            {copyStatus && (
              <p className="setup-detection__hint" role="status">
                {copyStatus}
              </p>
            )}

            {generateStatus && (
              <p
                className={
                  generateStatus.startsWith("Created")
                    ? "setup-detection__hint"
                    : "setup-detection__error"
                }
                role="status"
              >
                {generateStatus}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
