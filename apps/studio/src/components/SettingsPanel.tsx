import type { StudioConfig } from "../lib/studioConfig";
import { AdapterStatus } from "./AdapterStatus";
import { ContentAuditPanel } from "./ContentAuditPanel";
import { SetupDetectionPanel } from "./SetupDetectionPanel";
import { SetupHealthPanel } from "./SetupHealthPanel";
import { WriterWelcomeCard } from "./WriterWelcomeCard.js";

type SettingsPanelProps = {
  config: StudioConfig;
};

export function SettingsPanel({ config }: SettingsPanelProps) {
  return (
    <div className="settings-view">
      <section
        className="settings-view__group"
        aria-label="Status and configuration"
      >
        <h2 className="settings-view__group-title">Status &amp; configuration</h2>
        <WriterWelcomeCard variant="settings" />
        <SetupHealthPanel />
      </section>

      <details className="settings-view__advanced">
        <summary className="settings-view__advanced-summary">
          Advanced configuration
        </summary>

        <section className="settings-view__group" aria-label="Diagnostics">
          <h2 className="settings-view__group-title">Diagnostics</h2>
          <SetupDetectionPanel />
          <ContentAuditPanel />
        </section>

        <section className="panel settings-panel">
          <div className="panel__header">
            <h2 className="panel__title">Paths and targets</h2>
            <p className="panel__meta">
              Read-only summary for developers and technical helpers
            </p>
          </div>

          <p className="settings-panel__note">
            These values are read-only here. Run <code>pnpm setup</code> for a
            guided wizard, or edit <code>sourcedraft.config.json</code> for
            folders and categories and <code>.env</code> for credentials.
            Secrets never reach the browser.
          </p>

          <div className="settings-panel__grid">
            <label className="field">
              <span className="field__label">Article folder (contentDir)</span>
              <input
                className="field__input field__input--mono"
                type="text"
                value={config.contentDir}
                readOnly
              />
            </label>

            <label className="field">
              <span className="field__label">Blog type (adapter)</span>
              <input
                className="field__input field__input--mono"
                type="text"
                value={config.adapter}
                readOnly
              />
            </label>

            <label className="field">
              <span className="field__label">GitHub owner</span>
              <input
                className="field__input field__input--mono"
                type="text"
                value={config.githubOwner}
                placeholder="Not configured yet"
                readOnly
              />
            </label>

            <label className="field">
              <span className="field__label">GitHub repository</span>
              <input
                className="field__input field__input--mono"
                type="text"
                value={config.githubRepo}
                placeholder="Not configured yet"
                readOnly
              />
            </label>

            <label className="field">
              <span className="field__label">Branch</span>
              <input
                className="field__input field__input--mono"
                type="text"
                value={config.defaultBranch}
                readOnly
              />
            </label>

            <label className="field">
              <span className="field__label">Image folder (mediaDir)</span>
              <input
                className="field__input field__input--mono"
                type="text"
                value={config.mediaDir}
                readOnly
              />
            </label>

            <label className="field">
              <span className="field__label">Public image path</span>
              <input
                className="field__input field__input--mono"
                type="text"
                value={config.publicMediaPath}
                readOnly
              />
            </label>

            <label className="field field--full">
              <span className="field__label">Categories</span>
              <input
                className="field__input field__input--mono"
                type="text"
                value={config.categories.join(", ")}
                readOnly
              />
            </label>
          </div>
        </section>

        <AdapterStatus
          adapter={config.adapter}
          githubOwner={config.githubOwner}
          githubRepo={config.githubRepo}
          contentDir={config.contentDir}
        />
      </details>
    </div>
  );
}
