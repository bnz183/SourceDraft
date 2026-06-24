import { useEffect, useMemo, useState } from "react";
import {
  friendlyConfidenceLabel,
  siteTypeFromConfig,
} from "../lib/detectionCopy.js";
import {
  dashboardNextActions,
  summarizePostsForDashboard,
  type DashboardActionTarget,
} from "../lib/onboardingWizard.js";
import type { PostSummary } from "../lib/posts.js";
import {
  fetchSetupDetection,
  type SetupDetectionReport,
} from "../lib/setupDetection.js";
import {
  fetchSetupHealth,
  type SetupHealthReport,
} from "../lib/setupHealth.js";
import type { StudioConfig } from "../lib/studioConfig.js";

type DashboardPanelProps = {
  config: StudioConfig;
  demoMode: boolean;
  githubReady: boolean;
  posts: PostSummary[];
  postsLoading: boolean;
  onboardingComplete: boolean;
  onOpenPosts: () => void;
  onOpenSettings: () => void;
  onStartSetup: () => void;
  onEditPost: (path: string) => void;
  onNewPost: () => void;
};

function connectionLabel(options: {
  demoMode: boolean;
  githubReady: boolean;
  setupReady: boolean;
}): { text: string; tone: "ok" | "idle" | "off" } {
  if (options.demoMode) {
    return { text: "Demo mode", tone: "idle" };
  }

  if (options.githubReady && options.setupReady) {
    return { text: "Connected and ready", tone: "ok" };
  }

  if (options.githubReady) {
    return { text: "Connected — needs attention", tone: "idle" };
  }

  return { text: "Not connected", tone: "off" };
}

export function DashboardPanel({
  config,
  demoMode,
  githubReady,
  posts,
  postsLoading,
  onboardingComplete,
  onOpenPosts,
  onOpenSettings,
  onStartSetup,
  onEditPost,
  onNewPost,
}: DashboardPanelProps) {
  const [health, setHealth] = useState<SetupHealthReport | null>(null);
  const [detection, setDetection] = useState<SetupDetectionReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([fetchSetupHealth(), fetchSetupDetection()]).then(
      ([nextHealth, nextDetection]) => {
        if (cancelled) {
          return;
        }

        setHealth(nextHealth);
        setDetection(nextDetection);
        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const postStats = useMemo(() => summarizePostsForDashboard(posts), [posts]);
  const siteType = siteTypeFromConfig(
    config.adapter,
    detection?.primary?.framework ?? null,
  );
  const connection = connectionLabel({
    demoMode,
    githubReady,
    setupReady: health?.ok === true,
  });
  const nextActions = dashboardNextActions({
    demoMode,
    githubReady,
    setupReady: health?.ok === true,
    setupNextAction: health?.nextAction ?? null,
    postStats,
    detectionComplete: onboardingComplete || detection?.configExists === true,
  });

  function handleActionClick(target: DashboardActionTarget): void {
    switch (target) {
      case "setup-wizard":
        onStartSetup();
        return;
      case "posts":
        onOpenPosts();
        return;
      case "settings":
      case "settings-readiness":
        onOpenSettings();
        return;
      case "new-article":
        onNewPost();
        return;
      default:
        return;
    }
  }

  return (
    <main className="dashboard" aria-labelledby="dashboard-title">
      <header className="dashboard__intro">
        <h1 className="dashboard__heading" id="dashboard-title">
          Dashboard
        </h1>
        <p className="dashboard__subhead">
          {demoMode
            ? "Explore SourceDraft with sample content. Nothing is sent to a real blog."
            : "See what is connected, what you have written, and what to do next."}
        </p>
      </header>

      <div className="dashboard__grid">
        <section className="dashboard-card" aria-labelledby="dashboard-status-title">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title" id="dashboard-status-title">
              Connection
            </h2>
            <span
              className={`status-badge status-badge--${connection.tone}`}
              role="status"
            >
              {connection.text}
            </span>
          </div>
          {loading && (
            <p className="dashboard-card__loading" role="status">
              Checking connection…
            </p>
          )}
          {!loading && (
            <dl className="dashboard-card__facts">
              <div>
                <dt>Site type</dt>
                <dd>{siteType}</dd>
              </div>
              <div>
                <dt>Articles folder</dt>
                <dd>{config.contentDir}</dd>
              </div>
              {!demoMode && (
                <div>
                  <dt>Blog connection</dt>
                  <dd>
                    {githubReady
                      ? `Connected to ${config.githubOwner}/${config.githubRepo}`
                      : "Not connected yet"}
                  </dd>
                </div>
              )}
              {detection?.primary && !demoMode && (
                <div>
                  <dt>Site scan</dt>
                  <dd>
                    {friendlyConfidenceLabel(detection.primary.confidence)}
                    {detection.warnings.length > 0 ? " — review notes in Settings" : ""}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </section>

        <section className="dashboard-card" aria-labelledby="dashboard-content-title">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title" id="dashboard-content-title">
              Your content
            </h2>
          </div>
          {postsLoading ? (
            <p className="dashboard-card__loading" role="status">
              Loading articles…
            </p>
          ) : (
            <>
              <div className="dashboard-stats">
                <div className="dashboard-stat">
                  <span className="dashboard-stat__value">{postStats.total}</span>
                  <span className="dashboard-stat__label">Total</span>
                </div>
                <div className="dashboard-stat">
                  <span className="dashboard-stat__value">
                    {postStats.published}
                  </span>
                  <span className="dashboard-stat__label">Published</span>
                </div>
                <div className="dashboard-stat">
                  <span className="dashboard-stat__value">{postStats.drafts}</span>
                  <span className="dashboard-stat__label">Drafts</span>
                </div>
              </div>

              {postStats.recent.length === 0 ? (
                <div className="empty-state dashboard-card__empty">
                  <p className="empty-state__title">No articles yet</p>
                  <p className="empty-state__body">
                    Create a draft to try the editor and preview.
                  </p>
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={onNewPost}
                  >
                    New article
                  </button>
                </div>
              ) : (
                <div className="dashboard-recent">
                  <h3 className="dashboard-recent__title">Recent articles</h3>
                  <ul className="dashboard-recent__list">
                    {postStats.recent.map((post) => (
                      <li key={post.path}>
                        <button
                          type="button"
                          className="dashboard-recent__item"
                          onClick={() => onEditPost(post.path)}
                        >
                          <span className="dashboard-recent__name">
                            {post.title}
                          </span>
                          <span className="dashboard-recent__meta">
                            {post.draft ? "Draft" : "Published"} · {post.pubDate}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </section>

        <section
          className="dashboard-card dashboard-card--wide"
          aria-labelledby="dashboard-next-title"
        >
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title" id="dashboard-next-title">
              Next actions
            </h2>
          </div>
          <ol className="dashboard-actions" role="list">
            {nextActions.map((action) => (
              <li key={action.id} className="dashboard-actions__item">
                <button
                  type="button"
                  className="dashboard-actions__button"
                  onClick={() => handleActionClick(action.target)}
                >
                  <span className="dashboard-actions__title">{action.title}</span>
                  <span className="dashboard-actions__detail">{action.detail}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="dashboard-card__footer">
            <button
              type="button"
              className="button button--primary"
              onClick={onStartSetup}
            >
              {onboardingComplete ? "Review setup wizard" : "Run setup wizard"}
            </button>
            <button type="button" className="button" onClick={onOpenPosts}>
              Open Posts
            </button>
            <button
              type="button"
              className="button button--compact"
              onClick={onOpenSettings}
            >
              Settings
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
