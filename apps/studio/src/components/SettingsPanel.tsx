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
  const connected =
    config.githubOwner.trim().length > 0 && config.githubRepo.trim().length > 0;

  return (
    <div className="settings-view">
      <header className="settings-view__intro">
        <h1 className="settings-view__heading">Settings</h1>
        <p className="settings-view__subhead">
          {connected
            ? "Your blog is connected. Check publishing readiness below before you send."
            : "Connect your blog and confirm publishing is ready. Prefer to explore first? Demo mode needs no setup."}
        </p>
      </header>

      <section
        className="settings-view__step"
        aria-labelledby="setup-health-title"
      >
        <p className="settings-view__step-eyebrow">Step 1 · Publishing</p>
        <SetupHealthPanel />
      </section>

      <section
        className="settings-view__step"
        aria-labelledby="welcome-card-title"
      >
        <p className="settings-view__step-eyebrow">Step 2 · How it works</p>
        <WriterWelcomeCard variant="settings" />
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
