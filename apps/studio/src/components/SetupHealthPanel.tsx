import { useEffect, useState } from "react";
import {
  fetchSetupHealth,
  type SetupHealthReport,
} from "../lib/setupHealth.js";

export function SetupHealthPanel() {
  const [report, setReport] = useState<SetupHealthReport | null>(null);
  const [loading, setLoading] = useState(true);

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
          Setup health
        </h2>
        <p className="panel__meta">
          Safe server-side checks — tokens and secrets are never shown
        </p>
      </div>

      {loading && (
        <p className="setup-health__loading" role="status">
          Checking setup…
        </p>
      )}

      {!loading && report === null && (
        <p className="setup-health__error" role="alert">
          Could not load setup health. Confirm the publish API is running.
        </p>
      )}

      {report && (
        <>
          {report.nextAction && (
            <div className="notice notice--warning setup-health__next-action" role="status">
              <p className="notice__title">Next action</p>
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
                  {check.ok ? "OK" : "Needs attention"}
                </span>
                <span className="setup-health__label">{check.label}</span>
                <span className="setup-health__detail">{check.detail}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
