import { useEffect, useState } from "react";
import {
  fetchSetupHealth,
  type SetupHealthReport,
} from "../lib/setupHealth.js";
import { CompatibilityPanel } from "./CompatibilityPanel.js";

export function SetupHealthPanel() {
  const [report, setReport] = useState<SetupHealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchSetupHealth().then((next) => {
      setReport(next);
      setLoading(false);
    });
  }, []);

  return (
    <section className="panel setup-health" aria-labelledby="setup-health-title">
      <div className="panel__header">
        <h2 className="panel__title" id="setup-health-title">
          Publishing readiness
        </h2>
        <p className="panel__meta">
          Checks whether SourceDraft can send articles to your blog. Credentials
          are checked on the server and never shown here.
        </p>
      </div>

      {loading && (
        <p className="setup-health__loading" role="status">
          Checking whether publishing is ready…
        </p>
      )}

      {!loading && report === null && (
        <p className="setup-health__error" role="alert">
          Could not check publishing readiness. Confirm the publish service is
          running.
        </p>
      )}

      {report && (
        <>
          {report.nextAction && (
            <div className="notice notice--warning setup-health__next-action" role="status">
              <p className="notice__title">What to do next</p>
              <p className="notice__body">{report.nextAction}</p>
            </div>
          )}

          <ul className="setup-health__list">
            {report.checks.map((check) => (
              <li
                key={check.id}
                className={
                  check.ok
                    ? "setup-health__item setup-health__item--ok"
                    : "setup-health__item setup-health__item--warn"
                }
              >
                <span className="setup-health__status" aria-hidden="true">
                  {check.ok ? "Ready" : "Needs attention"}
                </span>
                <span className="setup-health__label">{check.label}</span>
                <span className="setup-health__detail">{check.detail}</span>
              </li>
            ))}
          </ul>

          <div className="setup-health__advanced">
            <button
              type="button"
              className="button button--compact setup-health__advanced-toggle"
              aria-expanded={showAdvanced}
              onClick={() => setShowAdvanced((current) => !current)}
            >
              {showAdvanced ? "Hide advanced details" : "Show advanced details"}
            </button>

            {showAdvanced && (
              <CompatibilityPanel compatibility={report.compatibility} />
            )}
          </div>
        </>
      )}
    </section>
  );
}
