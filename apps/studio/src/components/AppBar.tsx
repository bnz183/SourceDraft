import { DocumentStatusIndicator } from "./DocumentStatus";
import type { DocumentStatus } from "../lib/autosave.js";

type AppBarProps = {
  adapter: string;
  documentStatus: DocumentStatus | null;
  githubOwner: string;
  githubRepo: string;
  githubReady: boolean;
  settingsActive: boolean;
  onOpenSettings: () => void;
  onLogout: () => void;
};

function adapterLabel(adapter: string): string {
  switch (adapter) {
    case "markdown":
      return "Markdown";
    case "nextjs-mdx":
      return "Next.js MDX";
    case "hugo-markdown":
      return "Hugo Markdown";
    case "eleventy-jekyll-markdown":
      return "Eleventy/Jekyll";
    case "docusaurus-mdx":
      return "Docusaurus MDX";
    case "mkdocs-markdown":
      return "MkDocs";
    case "nuxt-content-markdown":
      return "Nuxt Content";
    default:
      return "MDX";
  }
}

export function AppBar({
  adapter,
  documentStatus,
  githubOwner,
  githubRepo,
  githubReady,
  settingsActive,
  onOpenSettings,
  onLogout,
}: AppBarProps) {
  const repoLabel = githubReady
    ? `${githubOwner}/${githubRepo}`
    : "Blog not connected";

  return (
    <header className="app-bar">
      <div className="app-bar__brand">
        <span className="app-bar__wordmark">SourceDraft</span>
        <span className="app-bar__subtitle">Writing dashboard</span>
      </div>

      <div className="app-bar__meta">
        {documentStatus && <DocumentStatusIndicator status={documentStatus} />}
        <span
          className={
            githubReady ? "app-bar__badge" : "app-bar__badge app-bar__badge--muted"
          }
          title={githubReady ? "Connected blog repository" : "Open Settings to connect your blog"}
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
