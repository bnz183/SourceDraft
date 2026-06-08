type AppBarProps = {
  adapter: string;
  githubOwner: string;
  githubRepo: string;
  githubReady: boolean;
  settingsActive: boolean;
  onOpenSettings: () => void;
  onLogout: () => void;
};

function adapterLabel(adapter: string): string {
  return adapter === "markdown" ? "Markdown" : "MDX";
}

export function AppBar({
  adapter,
  githubOwner,
  githubRepo,
  githubReady,
  settingsActive,
  onOpenSettings,
  onLogout,
}: AppBarProps) {
  const repoLabel = githubReady
    ? `${githubOwner}/${githubRepo}`
    : "GitHub not configured";

  return (
    <header className="app-bar">
      <div className="app-bar__brand">
        <span className="app-bar__wordmark">SourceDraft</span>
        <span className="app-bar__subtitle">Git-backed writing studio</span>
      </div>

      <div className="app-bar__meta">
        <span
          className={
            githubReady ? "app-bar__badge" : "app-bar__badge app-bar__badge--muted"
          }
          title={githubReady ? "Target repository" : "Set GITHUB_OWNER and GITHUB_REPO in .env"}
        >
          {repoLabel}
        </span>
        <span className="app-bar__badge app-bar__badge--accent">
          {adapterLabel(adapter)}
        </span>
      </div>

      <div className="app-bar__actions">
        <button
          type="button"
          className={
            settingsActive
              ? "button button--compact app-bar__action app-bar__action--active"
              : "button button--compact app-bar__action"
          }
          aria-current={settingsActive ? "page" : undefined}
          aria-expanded={settingsActive}
          onClick={onOpenSettings}
        >
          {settingsActive ? "Back to editor" : "Settings"}
        </button>
        <button
          type="button"
          className="button button--compact app-bar__action"
          onClick={onLogout}
        >
          Log out
        </button>
      </div>
    </header>
  );
}
