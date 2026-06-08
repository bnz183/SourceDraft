import { getAdapterPostPath, isAdapterId } from "@sourcedraft/adapters";
import { normalizeArticle, validateArticle } from "@sourcedraft/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppBar } from "./components/AppBar";
import { AstroMdxPreview } from "./components/AstroMdxPreview";
import { DemoBanner } from "./components/DemoBanner";
import { LoginScreen } from "./components/LoginScreen";
import { PostDetailsPanel } from "./components/PostDetailsPanel";
import { PostSidebar } from "./components/PostSidebar";
import { PublishGate } from "./components/PublishGate";
import { RestoreDraftBanner } from "./components/RestoreDraftBanner";
import { SettingsPanel } from "./components/SettingsPanel";
import { WritingCanvas } from "./components/WritingCanvas";
import { useDocumentAutosave } from "./hooks/useDocumentAutosave";
import {
  enterDemo,
  fetchAuthStatus,
  login as loginToStudio,
  logout as logoutFromStudio,
} from "./lib/auth";
import {
  articleInputToFormState,
  createInitialFormState,
  formStateToArticleInput,
  slugFromTitle,
  type ArticleFormState,
} from "./lib/articleForm";
import { fetchPost, fetchPosts, type PostSummary } from "./lib/posts";
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
  const [demoMode, setDemoMode] = useState(false);
  const [demoModeForced, setDemoModeForced] = useState(false);
  const [demoModeAvailable, setDemoModeAvailable] = useState(false);
  const [view, setView] = useState<View>("editor");
  const [studioConfig, setStudioConfig] = useState<StudioConfig>(
    FALLBACK_STUDIO_CONFIG,
  );
  const [form, setForm] = useState<ArticleFormState>(() =>
    createInitialFormState(FALLBACK_STUDIO_CONFIG.categories[0]),
  );
  const [slugAuto, setSlugAuto] = useState(true);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [loadPostError, setLoadPostError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [latestUploadedImagePath, setLatestUploadedImagePath] = useState<
    string | null
  >(null);

  const articleInput = useMemo(() => formStateToArticleInput(form), [form]);
  const validation = useMemo(
    () => validateArticle(articleInput),
    [articleInput],
  );
  const fieldErrors = useMemo(
    () => issuesByField(validation.issues),
    [validation.issues],
  );

  const refreshPosts = useCallback(async () => {
    setPostsLoading(true);
    setPostsError(null);

    const result = await fetchPosts();
    if (result.ok) {
      setPosts(result.posts);
    } else {
      setPostsError(result.error);
    }

    setPostsLoading(false);
  }, []);

  useEffect(() => {
    fetchAuthStatus().then((status) => {
      setAuthConfigured(status.configured);
      setAuthenticated(status.authenticated);
      setDemoMode(status.demoMode === true);
      setDemoModeForced(status.demoModeForced === true);
      setDemoModeAvailable(status.demoModeAvailable === true);
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    fetchStudioConfig().then((config) => {
      setStudioConfig(config);
      setDemoMode(config.demoMode === true);
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

    void refreshPosts();
  }, [authenticated, refreshPosts]);

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

  const outputPath = useMemo(() => {
    if (!validation.valid || !normalizedArticle) {
      return null;
    }

    if (editingPath && editingPath.length > 0) {
      return editingPath;
    }

    const adapterId = isAdapterId(studioConfig.adapter)
      ? studioConfig.adapter
      : "astro-mdx";

    return getAdapterPostPath(adapterId, normalizedArticle, {
      contentDir: studioConfig.contentDir,
      ...(studioConfig.adapterOptions !== undefined
        ? { adapterOptions: studioConfig.adapterOptions }
        : {}),
    });
  }, [
    validation.valid,
    normalizedArticle,
    editingPath,
    studioConfig.adapter,
    studioConfig.adapterOptions,
    studioConfig.contentDir,
  ]);

  const documentSnapshot = useMemo(
    () => ({
      form,
      editingPath,
      slugAuto,
    }),
    [form, editingPath, slugAuto],
  );

  const {
    documentStatus,
    restorePrompt,
    applyRestore,
    discardDraft,
    commitBaseline,
    checkRestorePrompt,
  } = useDocumentAutosave({
    snapshot: documentSnapshot,
    publishing,
    enabled: authenticated && view === "editor",
  });

  function resetEditor(defaultCategory?: string) {
    setEditingPath(null);
    setLoadPostError(null);
    setSlugAuto(true);
    setPublishError(null);
    setPublishSuccess(null);
    setView("editor");
    const nextForm = createInitialFormState(
      defaultCategory ?? studioConfig.categories[0],
    );
    setForm(nextForm);

    const nextSnapshot = {
      form: nextForm,
      editingPath: null,
      slugAuto: true,
    };
    commitBaseline(nextSnapshot, {
      remoteSync: false,
      clearLocalDraft: false,
    });
    checkRestorePrompt(nextSnapshot);
  }

  function handleRestoreDraft() {
    const restored = applyRestore();
    if (!restored) {
      return;
    }

    setForm(restored.form);
    setEditingPath(restored.editingPath);
    setSlugAuto(restored.slugAuto);
    setPublishError(null);
    setPublishSuccess(null);
    setLoadPostError(null);
    setView("editor");
  }

  function handleDiscardDraft() {
    discardDraft();
  }

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

  function handleUseHeroImage(publicPath: string) {
    setForm((current) => ({ ...current, heroImage: publicPath }));
  }

  function handleInsertImage(publicPath: string) {
    const alt = form.title.trim() || "Image";
    const snippet = `\n\n![${alt}](${publicPath})\n`;

    setForm((current) => ({
      ...current,
      body: `${current.body}${snippet}`,
    }));
  }

  function handleInsertPdfLink(publicPath: string, filename: string) {
    const label = filename.replace(/\.pdf$/iu, "") || "Document";
    const snippet = `\n\n[${label}](${publicPath})\n`;

    setForm((current) => ({
      ...current,
      body: `${current.body}${snippet}`,
    }));
  }

  async function handleEditPost(path: string) {
    setLoadPostError(null);
    setView("editor");

    const result = await fetchPost(path);
    if (!result.ok) {
      setLoadPostError(result.error);
      return;
    }

    const loadedForm = articleInputToFormState(
      result.article,
      studioConfig.categories[0] ?? "Guides",
    );
    setForm(loadedForm);
    setSlugAuto(false);
    setEditingPath(result.path);
    setPublishError(null);
    setPublishSuccess(null);

    const nextSnapshot = {
      form: loadedForm,
      editingPath: result.path,
      slugAuto: false,
    };
    commitBaseline(nextSnapshot, {
      remoteSync: true,
      clearLocalDraft: false,
    });
    checkRestorePrompt(nextSnapshot);
  }

  async function handleLogin(password: string) {
    const result = await loginToStudio(password);
    if (result.ok) {
      const status = await fetchAuthStatus();
      setAuthenticated(true);
      setDemoMode(status.demoMode === true);
      setDemoModeForced(status.demoModeForced === true);
      setDemoModeAvailable(status.demoModeAvailable === true);
    }
    return result;
  }

  async function handleEnterDemo() {
    const result = await enterDemo();
    if (result.ok) {
      const status = await fetchAuthStatus();
      setAuthenticated(true);
      setDemoMode(true);
      setDemoModeForced(status.demoModeForced === true);
      setDemoModeAvailable(status.demoModeAvailable === true);
    }
    return result;
  }

  async function handleLogout() {
    await logoutFromStudio();
    setAuthenticated(false);
    setPosts([]);
    setEditingPath(null);
    setPublishError(null);
    setPublishSuccess(null);
    setView("editor");
  }

  async function handlePublish() {
    if (!validation.valid) {
      return;
    }

    setPublishing(true);
    setPublishError(null);
    setPublishSuccess(null);

    try {
      const result = await publishArticleToGitHub(articleInput, editingPath);

      if (!result.ok) {
        const issueSummary =
          result.issues && result.issues.length > 0
            ? ` ${result.issues[0]?.message}`
            : "";
        setPublishError(`${result.error}${issueSummary}`);
        return;
      }

      const action = result.created ? "Created" : "Updated";
      setPublishSuccess(
        `${action} ${result.path} (commit ${result.commitSha.slice(0, 7)}).`,
      );
      setEditingPath(result.path);
      commitBaseline(
        {
          form,
          editingPath: result.path,
          slugAuto,
        },
        {
          remoteSync: true,
          clearLocalDraft: true,
        },
      );
      await refreshPosts();
    } catch {
      setPublishError(
        "Could not reach the publish API. Start the dev server and try again.",
      );
    } finally {
      setPublishing(false);
    }
  }

  if (!authChecked) {
    return (
      <div className="login-screen">
        <p className="login-screen__loading" role="status">
          Checking session…
        </p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <LoginScreen
        configured={authConfigured}
        demoAvailable={demoModeAvailable}
        demoForced={demoModeForced}
        onLogin={handleLogin}
        onEnterDemo={handleEnterDemo}
      />
    );
  }

  return (
    <div className="studio">
      {demoMode && <DemoBanner forced={demoModeForced} />}
      <AppBar
        adapter={studioConfig.adapter}
        documentStatus={view === "editor" ? documentStatus : null}
        githubOwner={studioConfig.githubOwner}
        githubRepo={studioConfig.githubRepo}
        githubReady={githubReady}
        settingsActive={view === "settings"}
        onOpenSettings={() =>
          setView((current) => (current === "settings" ? "editor" : "settings"))
        }
        onLogout={handleLogout}
      />

      {view === "settings" ? (
        <main className="studio__settings">
          <SettingsPanel config={studioConfig} />
        </main>
      ) : (
        <div className="studio__workspace">
          <PostSidebar
            posts={posts}
            loading={postsLoading}
            error={postsError}
            githubReady={githubReady}
            activePath={editingPath}
            loadPostError={loadPostError}
            onNewPost={() => resetEditor()}
            onRefresh={() => {
              void refreshPosts();
            }}
            onEdit={(path) => {
              void handleEditPost(path);
            }}
          />

          <main className="studio__canvas-column">
            {restorePrompt && (
              <RestoreDraftBanner
                autosave={restorePrompt}
                onRestore={handleRestoreDraft}
                onDiscard={handleDiscardDraft}
              />
            )}

            <WritingCanvas
              title={form.title}
              description={form.description}
              body={form.body}
              editingPath={editingPath}
              draft={form.draft}
              latestImagePath={latestUploadedImagePath}
              posts={posts}
              fieldErrors={fieldErrors}
              onTitleChange={(value) => handleFieldChange("title", value)}
              onDescriptionChange={(value) =>
                handleFieldChange("description", value)
              }
              onBodyChange={handleBodyChange}
            />

            <AstroMdxPreview
              valid={validation.valid}
              issues={validation.issues}
              article={normalizedArticle}
              contentDir={studioConfig.contentDir}
              adapter={studioConfig.adapter}
              adapterOptions={studioConfig.adapterOptions}
              outputPath={editingPath}
            />

            <PublishGate
              ready={validation.valid}
              publishing={publishing}
              publishError={publishError}
              publishSuccess={publishSuccess}
              githubReady={githubReady}
              demoMode={demoMode}
              onPublish={handlePublish}
            />
          </main>

          <PostDetailsPanel
            values={form}
            categories={studioConfig.categories}
            githubReady={githubReady}
            fieldErrors={fieldErrors}
            slugAuto={slugAuto}
            valid={validation.valid}
            issues={validation.issues}
            outputPath={outputPath}
            onChange={handleFieldChange}
            onSlugManualEdit={handleSlugManualEdit}
            onSlugResync={handleSlugResync}
            onUseHeroImage={handleUseHeroImage}
            onInsertImage={handleInsertImage}
            onInsertPdfLink={handleInsertPdfLink}
            onUploadSuccess={setLatestUploadedImagePath}
          />
        </div>
      )}
    </div>
  );
}

export default App;
