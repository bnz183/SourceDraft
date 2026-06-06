import { normalizeArticle, validateArticle } from "@sourcedraft/core";
import { useEffect, useMemo, useState } from "react";
import { AdapterStatus } from "./components/AdapterStatus";
import { ArticlePipeline } from "./components/ArticlePipeline";
import { CommandBar } from "./components/CommandBar";
import { EditorWorkspace } from "./components/EditorWorkspace";
import { FrontmatterInspector } from "./components/FrontmatterInspector";
import { AstroMdxPreview } from "./components/AstroMdxPreview";
import { LoginScreen } from "./components/LoginScreen";
import { PublishGate } from "./components/PublishGate";
import {
  fetchAuthStatus,
  login as loginToStudio,
  logout as logoutFromStudio,
} from "./lib/auth";
import {
  createInitialFormState,
  formStateToArticleInput,
  slugFromTitle,
  type ArticleFormState,
} from "./lib/articleForm";
import { publishArticle as publishArticleToGitHub } from "./lib/publish";
import {
  FALLBACK_STUDIO_CONFIG,
  fetchStudioConfig,
  type StudioConfig,
} from "./lib/studioConfig";
import type { View } from "./types/view";

function issuesByField(
  issues: { field: string; message: string }[],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of issues) {
    if (map[issue.field] === undefined) {
      map[issue.field] = issue.message;
    }
  }
  return map;
}

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authConfigured, setAuthConfigured] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [studioConfig, setStudioConfig] = useState<StudioConfig>(
    FALLBACK_STUDIO_CONFIG,
  );
  const [form, setForm] = useState<ArticleFormState>(() =>
    createInitialFormState(FALLBACK_STUDIO_CONFIG.categories[0]),
  );
  const [slugAuto, setSlugAuto] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  const articleInput = useMemo(() => formStateToArticleInput(form), [form]);
  const validation = useMemo(
    () => validateArticle(articleInput),
    [articleInput],
  );
  const fieldErrors = useMemo(
    () => issuesByField(validation.issues),
    [validation.issues],
  );

  useEffect(() => {
    fetchAuthStatus().then((status) => {
      setAuthConfigured(status.configured);
      setAuthenticated(status.authenticated);
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    fetchStudioConfig().then((config) => {
      setStudioConfig(config);
      setForm((current) => {
        if (current.title.length > 0 || current.body.length > 0) {
          return current;
        }

        return {
          ...createInitialFormState(config.categories[0] ?? "Guides"),
          slug: current.slug,
        };
      });
    });
  }, [authenticated]);

  const githubReady = useMemo(
    () =>
      studioConfig.githubOwner.trim().length > 0 &&
      studioConfig.githubRepo.trim().length > 0,
    [studioConfig.githubOwner, studioConfig.githubRepo],
  );

  const normalizedArticle = useMemo(() => {
    if (!validation.valid) {
      return null;
    }

    try {
      return normalizeArticle(articleInput);
    } catch {
      return null;
    }
  }, [articleInput, validation.valid]);

  function handleFieldChange(
    field: keyof ArticleFormState,
    value: string | boolean,
  ) {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "title" && slugAuto && typeof value === "string") {
        next.slug = slugFromTitle(value);
      }

      return next;
    });
  }

  function handleBodyChange(body: string) {
    setForm((current) => ({ ...current, body }));
  }

  function handleSlugManualEdit() {
    setSlugAuto(false);
  }

  function handleSlugResync() {
    setSlugAuto(true);
    setForm((current) => ({ ...current, slug: slugFromTitle(current.title) }));
  }

  async function handleLogin(password: string) {
    const result = await loginToStudio(password);
    if (result.ok) {
      setAuthenticated(true);
    }
    return result;
  }

  async function handleLogout() {
    await logoutFromStudio();
    setAuthenticated(false);
    setPublishError(null);
    setPublishSuccess(null);
  }

  async function handlePublish() {
    if (!validation.valid) {
      return;
    }

    setPublishing(true);
    setPublishError(null);
    setPublishSuccess(null);

    try {
      const result = await publishArticleToGitHub(articleInput);

      if (!result.ok) {
        const issueSummary =
          result.issues && result.issues.length > 0
            ? ` ${result.issues[0]?.message}`
            : "";
        setPublishError(`${result.error}${issueSummary}`);
        return;
      }

      const action = result.created ? "Created" : "Updated";
      setPublishSuccess(`${action} ${result.path} (${result.commitSha.slice(0, 7)})`);
    } catch {
      setPublishError("Could not reach the publish API. Is the server running?");
    } finally {
      setPublishing(false);
    }
  }

  if (!authChecked) {
    return (
      <div className="login-screen">
        <p className="login-screen__loading">Checking session...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <LoginScreen configured={authConfigured} onLogin={handleLogin} />
    );
  }

  return (
    <div className="studio">
      <CommandBar
        currentView={view}
        onViewChange={setView}
        onLogout={handleLogout}
      />

      <main className="studio__main">
        {view === "dashboard" && (
          <div className="studio__stack">
            <ArticlePipeline />
            <AdapterStatus
              adapter={studioConfig.adapter}
              githubOwner={studioConfig.githubOwner}
              githubRepo={studioConfig.githubRepo}
              contentDir={studioConfig.contentDir}
            />
          </div>
        )}

        {view === "new-article" && (
          <div className="studio__editor-layout">
            <div className="studio__editor-column">
              <EditorWorkspace body={form.body} onBodyChange={handleBodyChange} />
              {fieldErrors.body && (
                <p className="editor-workspace__error">{fieldErrors.body}</p>
              )}
              <AstroMdxPreview
                valid={validation.valid}
                issues={validation.issues}
                article={normalizedArticle}
                contentDir={studioConfig.contentDir}
              />
              <PublishGate
                ready={validation.valid}
                publishing={publishing}
                publishError={publishError}
                publishSuccess={publishSuccess}
                githubReady={githubReady}
                onPublish={handlePublish}
              />
            </div>
            <FrontmatterInspector
              values={form}
              categories={studioConfig.categories}
              fieldErrors={fieldErrors}
              slugAuto={slugAuto}
              onChange={handleFieldChange}
              onSlugManualEdit={handleSlugManualEdit}
              onSlugResync={handleSlugResync}
            />
          </div>
        )}

        {view === "settings" && (
          <div className="studio__stack">
            <section className="panel settings-panel">
              <div className="panel__header">
                <h2 className="panel__title">Publishing configuration</h2>
                <p className="panel__meta">
                  Paths and categories from sourcedraft.config.json. GitHub
                  target from .env.
                </p>
              </div>

              <p className="settings-panel__note">
                Publishing requires a GitHub token with write access to the
                target repository. The token is read only by the server when you
                publish.
              </p>

              <div className="settings-panel__grid">
                <label className="field">
                  <span className="field__label">Content directory</span>
                  <input
                    className="field__input field__input--mono"
                    type="text"
                    value={studioConfig.contentDir}
                    readOnly
                  />
                </label>

                <label className="field">
                  <span className="field__label">Adapter</span>
                  <input
                    className="field__input field__input--mono"
                    type="text"
                    value={studioConfig.adapter}
                    readOnly
                  />
                </label>

                <label className="field">
                  <span className="field__label">GitHub owner</span>
                  <input
                    className="field__input field__input--mono"
                    type="text"
                    value={studioConfig.githubOwner}
                    placeholder="Set GITHUB_OWNER in .env"
                    readOnly
                  />
                </label>

                <label className="field">
                  <span className="field__label">GitHub repository</span>
                  <input
                    className="field__input field__input--mono"
                    type="text"
                    value={studioConfig.githubRepo}
                    placeholder="Set GITHUB_REPO in .env"
                    readOnly
                  />
                </label>

                <label className="field">
                  <span className="field__label">Branch</span>
                  <input
                    className="field__input field__input--mono"
                    type="text"
                    value={studioConfig.defaultBranch}
                    readOnly
                  />
                </label>

                <label className="field">
                  <span className="field__label">Media directory</span>
                  <input
                    className="field__input field__input--mono"
                    type="text"
                    value={studioConfig.mediaDir}
                    readOnly
                  />
                </label>

                <label className="field field--full">
                  <span className="field__label">Categories</span>
                  <input
                    className="field__input field__input--mono"
                    type="text"
                    value={studioConfig.categories.join(", ")}
                    readOnly
                  />
                </label>
              </div>
            </section>

            <AdapterStatus
              adapter={studioConfig.adapter}
              githubOwner={studioConfig.githubOwner}
              githubRepo={studioConfig.githubRepo}
              contentDir={studioConfig.contentDir}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
