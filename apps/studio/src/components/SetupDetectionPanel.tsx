import { useEffect, useState } from "react";
import {
  fetchSetupDetection,
  generateSetupConfig,
  type SetupDetectionReport,
} from "../lib/setupDetection.js";

function plainLanguageSummary(report: SetupDetectionReport): string | null {
  if (!report.primary) {
    return null;
  }

  const { primary } = report;
  const adapterName = primary.adapter.replace(/-mdx$|-markdown$/u, "").replace(/-/gu, " ");
  const postsHint =
    primary.postFileCount > 0
      ? `${primary.postFileCount} post file(s) in \`${primary.contentDir}\``
      : `articles expected in \`${primary.contentDir}\``;
  return `We found a ${primary.framework} project for git-backed, AI-assisted publishing. Detected ${postsHint}. SourceDraft recommends the ${adapterName} adapter (${primary.confidence}% confidence) for automation-friendly Markdown/MDX workflows.`;
}

function nextAction(report: SetupDetectionReport): string {
  if (report.configExists) {
    return "Your config file already exists. Review Settings → Setup health, then edit sourcedraft.config.json if content paths or adapter settings need adjusting for your publish pipeline.";
  }

  if (report.primary && report.safeToApply) {
    return "Next step: generate a starter config for your content pipeline, or copy the values into sourcedraft.config.json manually before wiring deploy hooks.";
  }

  if (report.primary) {
    return "Next step: review the warnings below, then copy or generate config only if the detected folders match your CMS and automation setup.";
  }

  return "Next step: run pnpm setup from the SourceDraft folder, or ask your technical contact to configure git publishing and workflow tooling.";
}

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

  const summary = report ? plainLanguageSummary(report) : null;

  return (
    <section className="panel setup-detection" aria-labelledby="setup-detection-title">
      <div className="panel__header">
        <h2 className="panel__title" id="setup-detection-title">
          Setup detection
        </h2>
        <p className="panel__meta">
          Scans your project and suggests where posts and images should go — for
          technical helpers; nothing is changed automatically.
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
            Scanned folder: <code>{report.scannedRoot}</code>
          </p>

          {summary && (
            <p className="setup-detection__summary">{summary}</p>
          )}

          {report.onboardingMessage && !summary && (
            <p className="setup-detection__summary">{report.onboardingMessage}</p>
          )}

          <p className="setup-detection__next-action" role="status">
            {nextAction(report)}
          </p>

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
                  <dt>Detected site type</dt>
                  <dd>{report.primary.framework}</dd>
                </div>
                <div>
                  <dt>Recommended format</dt>
                  <dd>
                    <code>{report.primary.adapter}</code>
                  </dd>
                </div>
                <div>
                  <dt>Likely articles folder</dt>
                  <dd>
                    <code>{report.primary.contentRoot}</code>
                    {report.primary.postFileCount > 0 && (
                      <span className="setup-detection__meta">
                        {" "}
                        ({report.primary.postFileCount} post file
                        {report.primary.postFileCount === 1 ? "" : "s"} found)
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Likely images folder</dt>
                  <dd>
                    <code>{report.primary.mediaDir}</code>
                  </dd>
                </div>
                <div>
                  <dt>Public image URL path</dt>
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
                  <dt>Why we think so</dt>
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
                  <h3 className="setup-detection__subtitle">Fields found in sample posts</h3>
                  <p className="setup-detection__hint">
                    Studio maps these to its article form when you edit or create posts — useful
                    for automated and assisted publishing pipelines.
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
              No supported site type detected. Run <code>pnpm setup</code> or edit{" "}
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
            <details className="setup-detection__preview-wrap">
              <summary>Preview config values before writing</summary>
              <pre className="setup-detection__preview">{report.configPreviewSummary}</pre>
            </details>
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
                <code>sourcedraft.config.json</code> already exists — it will not be
                overwritten. Edit it manually if paths need changing.
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
                Review detection results before applying. Low confidence or warnings
                require manual confirmation.
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
