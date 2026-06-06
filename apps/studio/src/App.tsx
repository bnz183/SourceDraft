import { normalizeArticle, validateArticle } from "@sourcedraft/core";
import { useMemo, useState } from "react";
import { AdapterStatus } from "./components/AdapterStatus";
import { ArticlePipeline } from "./components/ArticlePipeline";
import { CommandBar } from "./components/CommandBar";
import { EditorWorkspace } from "./components/EditorWorkspace";
import { FrontmatterInspector } from "./components/FrontmatterInspector";
import { AstroMdxPreview } from "./components/AstroMdxPreview";
import { PublishGate } from "./components/PublishGate";
import {
  createInitialFormState,
  formStateToArticleInput,
  slugFromTitle,
  type ArticleFormState,
} from "./lib/articleForm";
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
  const [view, setView] = useState<View>("dashboard");
  const [form, setForm] = useState<ArticleFormState>(createInitialFormState);
  const [slugAuto, setSlugAuto] = useState(true);

  const articleInput = useMemo(() => formStateToArticleInput(form), [form]);
  const validation = useMemo(
    () => validateArticle(articleInput),
    [articleInput],
  );
  const fieldErrors = useMemo(
    () => issuesByField(validation.issues),
    [validation.issues],
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

  return (
    <div className="studio">
      <CommandBar currentView={view} onViewChange={setView} />

      <main className="studio__main">
        {view === "dashboard" && (
          <div className="studio__stack">
            <ArticlePipeline />
            <AdapterStatus />
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
              />
              <PublishGate ready={validation.valid} />
            </div>
            <FrontmatterInspector
              values={form}
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
                <p className="panel__meta">Stored locally until backend wiring</p>
              </div>

              <div className="settings-panel__grid">
                <label className="field">
                  <span className="field__label">Content directory</span>
                  <input
                    className="field__input field__input--mono"
                    type="text"
                    defaultValue="src/content/blog"
                    readOnly
                  />
                </label>

                <label className="field">
                  <span className="field__label">Adapter</span>
                  <input
                    className="field__input field__input--mono"
                    type="text"
                    defaultValue="astro-mdx"
                    readOnly
                  />
                </label>

                <label className="field">
                  <span className="field__label">GitHub owner</span>
                  <input
                    className="field__input field__input--mono"
                    type="text"
                    placeholder="owner"
                    disabled
                  />
                </label>

                <label className="field">
                  <span className="field__label">GitHub repository</span>
                  <input
                    className="field__input field__input--mono"
                    type="text"
                    placeholder="repo"
                    disabled
                  />
                </label>

                <label className="field">
                  <span className="field__label">Branch</span>
                  <input
                    className="field__input field__input--mono"
                    type="text"
                    defaultValue="main"
                    disabled
                  />
                </label>

                <label className="field">
                  <span className="field__label">Media directory</span>
                  <input
                    className="field__input field__input--mono"
                    type="text"
                    defaultValue="src/assets/images"
                    readOnly
                  />
                </label>
              </div>
            </section>

            <AdapterStatus />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
