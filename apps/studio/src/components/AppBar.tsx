import { DocumentStatusIndicator } from "./DocumentStatus";
import type { DocumentStatus } from "../lib/autosave.js";
import { themeLabel, type ThemePreference } from "../lib/theme";

type AppBarProps = {
  adapter: string;
  documentStatus: DocumentStatus | null;
  githubOwner: string;
  githubRepo: string;
  githubReady: boolean;
  theme: ThemePreference;
  onToggleTheme: () => void;
};

function themeIcon(theme: ThemePreference): string {
  switch (theme) {
    case "light":
      return "☀";
    case "dark":
      return "☾";
    default:
      return "◐";
  }
}

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
  theme,
  onToggleTheme,
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
          className="button button--compact app-bar__theme-toggle"
          aria-label={`Theme: ${themeLabel(theme)}. Switch theme.`}
          title={`Theme: ${themeLabel(theme)}`}
          onClick={onToggleTheme}
        >
          <span aria-hidden="true">{themeIcon(theme)}</span>
          <span className="app-bar__theme-label">{themeLabel(theme)}</span>
        </button>
      </div>
    </header>
  );
}
