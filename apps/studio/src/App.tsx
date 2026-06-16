import { getAdapterPostPath, isAdapterId } from "@sourcedraft/adapters";
import { normalizeArticle, validateArticle } from "@sourcedraft/core";
import type { PublishMode } from "@sourcedraft/publishers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppBar } from "./components/AppBar";
import { AstroMdxPreview } from "./components/AstroMdxPreview";
import { DemoBanner } from "./components/DemoBanner";
import { LoginScreen } from "./components/LoginScreen";
import { PostDetailsPanel } from "./components/PostDetailsPanel";
import { PostLoginWelcomeBanner } from "./components/PostLoginWelcomeBanner";
import { PostSidebar } from "./components/PostSidebar";
import { PublishGate } from "./components/PublishGate";
import { RestoreDraftBanner } from "./components/RestoreDraftBanner";
import { SettingsPanel } from "./components/SettingsPanel";
import { WritingCanvas } from "./components/WritingCanvas";
import type { LatestMediaUpload } from "./editor/SourceDraftEditor";
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
import { previewPrBranch } from "./lib/prBranch";
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
  const [publishSuccessUrl, setPublishSuccessUrl] = useState<string | null>(
    null,
  );
  const [publishMode, setPublishMode] = useState<PublishMode>("direct");
  const [latestUploadedImagePath, setLatestUploadedImagePath] = useState<
    string | null
  >(null);
  const [latestUpload, setLatestUpload] = useState<LatestMediaUpload | null>(
    null,
  );

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

    let cancelled = false;

    void fetchStudioConfig().then((config) => {
      if (cancelled) {
        return;
      }

      setStudioConfig(config);
      setPublishMode(config.publishMode);
      setDemoMode(config.demoMode === true);
      setForm((current) => {
        if (current.title.length > 0 || current.body.length > 0) {
          return current;
        }

        return {
          ...createInitialFormState(config.categories[0] ?? "AI-Assisted Publishing"),
          slug: current.slug,
        };
      });
    });

    const postsTimer = window.setTimeout(() => {
      void refreshPosts();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(postsTimer);
    };
  }, [authenticated, refreshPosts]);

  const githubReady = useMemo(
    () =>
      studioConfig.githubOwner.trim().length > 0 &&
      studioConfig.githubRepo.trim().length > 0,
    [studioConfig.githubOwner, studioConfig.githubRepo],
  );

  const mediaUploadAvailable = githubReady || demoMode;

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

  const prBranchPreview = useMemo(() => {
    if (!validation.valid || !normalizedArticle) {
      return null;
    }

    return previewPrBranch(normalizedArticle.slug, studioConfig.prBranchPrefix);
  }, [
    validation.valid,
    normalizedArticle,
    studioConfig.prBranchPrefix,
  ]);

  const prModeSupported = studioConfig.publisher === "github";

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

  function handleUploadSuccess(upload: LatestMediaUpload) {
    setLatestUpload(upload);
    if (upload.kind === "image") {
      setLatestUploadedImagePath(upload.publicPath);
    }
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
      studioConfig.categories[0] ?? "AI-Assisted Publishing",
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
    setPublishSuccessUrl(null);

    try {
      const result = await publishArticleToGitHub(articleInput, {
        sourcePath: editingPath,
        publishMode,
      });

      if (!result.ok) {
        const issueSummary =
          result.issues && result.issues.length > 0
            ? ` ${result.issues[0]?.message}`
            : "";
        setPublishError(`${result.error}${issueSummary}`);
        return;
      }

      const action = result.created ? "Created" : "Updated";
      const mode = result.publishMode ?? publishMode;

      if (mode === "direct") {
        const deployNote =
          result.deployHook?.triggered === true
            ? ` ${result.deployHook.ok ? "Deploy hook succeeded." : result.deployHook.message}`
            : "";

        setPublishSuccess(
          `${action} ${result.path} (commit ${result.commitSha.slice(0, 7)}).${deployNote}`,
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
        return;
      }

      const prLabel =
        typeof result.prNumber === "number"
          ? `PR #${result.prNumber}`
          : "Pull request";
      const prBranchNote =
        result.prBranch !== undefined ? ` on ${result.prBranch}` : "";

      setPublishSuccess(
        `${action} ${result.path}${prBranchNote} (${prLabel}, commit ${result.commitSha.slice(0, 7)}).${result.deployHookNote ? ` ${result.deployHookNote}` : ""}`,
      );
      if (typeof result.prUrl === "string" && result.prUrl.length > 0) {
        setPublishSuccessUrl(result.prUrl);
      }
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
      {demoMode && <DemoBanner forced={demoModeForced} onExitDemo={handleLogout} />}
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
        <>
          <PostLoginWelcomeBanner
            demoMode={demoMode}
            githubReady={githubReady}
            onOpenSettings={() => setView("settings")}
          />
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
              latestUpload={latestUpload}
              mediaUploadAvailable={mediaUploadAvailable}
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
              publishSuccessUrl={publishSuccessUrl}
              githubReady={githubReady}
              demoMode={demoMode}
              publishMode={publishMode}
              defaultPublishMode={studioConfig.publishMode}
              baseBranch={studioConfig.defaultBranch}
              outputPath={outputPath}
              prBranchPreview={prBranchPreview}
              prModeSupported={prModeSupported}
              validationIssues={validation.issues}
              formValues={form}
              knownPostSlugs={posts.map((post) => post.slug)}
              onPublishModeChange={setPublishMode}
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
            posts={posts}
            onChange={handleFieldChange}
            onSlugManualEdit={handleSlugManualEdit}
            onSlugResync={handleSlugResync}
            onUseHeroImage={handleUseHeroImage}
            onInsertImage={handleInsertImage}
            onInsertPdfLink={handleInsertPdfLink}
            onUploadSuccess={handleUploadSuccess}
          />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
