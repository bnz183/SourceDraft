import { useMemo, useState } from "react";
import { AdapterStatus } from "./components/AdapterStatus";
import { ArticlePipeline } from "./components/ArticlePipeline";
import { CommandBar } from "./components/CommandBar";
import { EditorWorkspace } from "./components/EditorWorkspace";
import {
  FrontmatterInspector,
  type FrontmatterState,
} from "./components/FrontmatterInspector";
import { PublishGate } from "./components/PublishGate";
import type { View } from "./types/view";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const INITIAL_FRONTMATTER: FrontmatterState = {
  title: "",
  slug: "",
  description: "",
  pubDate: "2026-06-06",
  updatedDate: "",
  category: "",
  tags: "",
  draft: true,
  heroImage: "",
};

function isSlugValid(slug: string): boolean {
  return slug.length > 0 && SLUG_PATTERN.test(slug);
}

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [body, setBody] = useState("");
  const [frontmatter, setFrontmatter] =
    useState<FrontmatterState>(INITIAL_FRONTMATTER);

  const publishChecks = useMemo(
    () => [
      {
        id: "title",
        label: "Title is set",
        passed: frontmatter.title.trim().length > 0,
      },
      {
        id: "slug",
        label: "Slug is URL-safe",
        passed: isSlugValid(frontmatter.slug.trim()),
      },
      {
        id: "description",
        label: "Description is set",
        passed: frontmatter.description.trim().length > 0,
      },
      {
        id: "pubDate",
        label: "Publication date is set",
        passed: frontmatter.pubDate.trim().length > 0,
      },
      {
        id: "category",
        label: "Category is set",
        passed: frontmatter.category.trim().length > 0,
      },
      {
        id: "body",
        label: "Body content is set",
        passed: body.trim().length > 0,
      },
    ],
    [frontmatter, body],
  );

  const publishReady = publishChecks.every((check) => check.passed);

  function handleFrontmatterChange(
    field: keyof FrontmatterState,
    value: string | boolean,
  ) {
    setFrontmatter((current) => ({ ...current, [field]: value }));
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
              <EditorWorkspace body={body} onBodyChange={setBody} />
              <PublishGate checks={publishChecks} ready={publishReady} />
            </div>
            <FrontmatterInspector
              values={frontmatter}
              onChange={handleFrontmatterChange}
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
