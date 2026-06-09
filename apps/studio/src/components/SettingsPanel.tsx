import type { StudioConfig } from "../lib/studioConfig";
import { AdapterStatus } from "./AdapterStatus";
import { ContentAuditPanel } from "./ContentAuditPanel";
import { SetupDetectionPanel } from "./SetupDetectionPanel";
import { SetupHealthPanel } from "./SetupHealthPanel";

type SettingsPanelProps = {
  config: StudioConfig;
};

export function SettingsPanel({ config }: SettingsPanelProps) {
  return (
    <div className="settings-view">
      <SetupDetectionPanel />
      <ContentAuditPanel />
      <SetupHealthPanel />

      <section className="panel settings-panel">
        <div className="panel__header">
          <h2 className="panel__title">Settings</h2>
          <p className="panel__meta">
            Project paths from config · GitHub target from .env
          </p>
        </div>

        <p className="settings-panel__note">
          These values are read-only here. Run <code>pnpm setup</code> for a
          guided wizard, or edit <code>sourcedraft.config.json</code> for folders
          and categories and <code>.env</code> for credentials. Secrets never
          reach the browser.
        </p>

        <div className="settings-panel__grid">
          <label className="field">
            <span className="field__label">Content directory</span>
            <input
              className="field__input field__input--mono"
              type="text"
              value={config.contentDir}
              readOnly
            />
          </label>

          <label className="field">
            <span className="field__label">Adapter</span>
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
              placeholder="Set GITHUB_OWNER in .env"
              readOnly
            />
          </label>

          <label className="field">
            <span className="field__label">GitHub repository</span>
            <input
              className="field__input field__input--mono"
              type="text"
              value={config.githubRepo}
              placeholder="Set GITHUB_REPO in .env"
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
            <span className="field__label">Media directory</span>
            <input
              className="field__input field__input--mono"
              type="text"
              value={config.mediaDir}
              readOnly
            />
          </label>

          <label className="field">
            <span className="field__label">Public media path</span>
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
    </div>
  );
}
