import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createInitialFormState } from "./articleForm.js";
import {
  AUTOSAVE_STORAGE_KEY,
  autosaveContextLabel,
  autosaveToSnapshot,
  clearAutosave,
  computeDocumentStatus,
  createAutosaveRecord,
  documentStatusLabel,
  formsEqual,
  isEmptyForm,
  loadAutosave,
  parseAutosave,
  saveAutosave,
  serializeAutosave,
  shouldShowDocumentStatus,
  snapshotsEqual,
} from "./autosave.js";

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

describe("autosave serialization", () => {
  it("round-trips a valid autosave record", () => {
    const snapshot = {
      form: {
        ...createInitialFormState("Guides"),
        title: "Draft title",
        body: "Hello",
      },
      editingPath: "src/content/blog/draft.mdx",
      slugAuto: false,
    };

    const record = createAutosaveRecord(snapshot, "2026-06-08T12:00:00.000Z");
    const parsed = parseAutosave(serializeAutosave(record));

    assert.ok(parsed);
    assert.equal(parsed.savedAt, "2026-06-08T12:00:00.000Z");
    assert.equal(parsed.editingPath, "src/content/blog/draft.mdx");
    assert.equal(parsed.form.title, "Draft title");
    assert.equal(parsed.slugAuto, false);
  });

  it("rejects invalid autosave payloads", () => {
    assert.equal(parseAutosave("{"), null);
    assert.equal(parseAutosave(JSON.stringify({ version: 2 })), null);
    assert.equal(
      parseAutosave(JSON.stringify({ version: 1, savedAt: "x", form: {} })),
      null,
    );
  });
});

describe("autosave storage helpers", () => {
  it("saves and loads from namespaced localStorage key", () => {
    const storage = createMemoryStorage();
    const snapshot = {
      form: createInitialFormState(),
      editingPath: null,
      slugAuto: true,
    };

    saveAutosave(storage, snapshot, "2026-06-08T10:00:00.000Z");
    assert.ok(storage.getItem(AUTOSAVE_STORAGE_KEY));

    const loaded = loadAutosave(storage);
    assert.ok(loaded);
    assert.equal(loaded.savedAt, "2026-06-08T10:00:00.000Z");
    assert.equal(loaded.editingPath, null);
  });

  it("clears autosave storage", () => {
    const storage = createMemoryStorage();
    saveAutosave(storage, {
      form: createInitialFormState(),
      editingPath: null,
      slugAuto: true,
    });
    clearAutosave(storage);
    assert.equal(loadAutosave(storage), null);
  });
});

describe("snapshot comparison", () => {
  it("detects equal and unequal form snapshots", () => {
    const left = createInitialFormState();
    const right = { ...left, title: "Changed" };

    assert.equal(formsEqual(left, left), true);
    assert.equal(formsEqual(left, right), false);
  });

  it("compares full document snapshots", () => {
    const base = {
      form: createInitialFormState(),
      editingPath: null,
      slugAuto: true,
    };

    assert.equal(snapshotsEqual(base, { ...base }), true);
    assert.equal(
      snapshotsEqual(base, { ...base, editingPath: "src/content/blog/a.mdx" }),
      false,
    );
    assert.equal(
      snapshotsEqual(base, autosaveToSnapshot(createAutosaveRecord(base))),
      true,
    );
  });

  it("detects empty forms", () => {
    assert.equal(isEmptyForm(createInitialFormState()), true);
    assert.equal(
      isEmptyForm({ ...createInitialFormState(), title: "Draft" }),
      false,
    );
  });
});

describe("document status", () => {
  it("prioritizes publishing and restore states", () => {
    assert.equal(
      computeDocumentStatus({
        isDirty: true,
        publishing: true,
        restorePromptVisible: false,
        localSavedAt: "2026-06-08T10:00:00.000Z",
        syncedWithRemote: false,
      }).kind,
      "publishing",
    );

    assert.equal(
      computeDocumentStatus({
        isDirty: false,
        publishing: false,
        restorePromptVisible: true,
        localSavedAt: "2026-06-08T10:00:00.000Z",
        syncedWithRemote: true,
      }).kind,
      "restore-available",
    );
  });

  it("reports published, saved locally, unsaved, and idle states", () => {
    assert.equal(
      computeDocumentStatus({
        isDirty: false,
        publishing: false,
        restorePromptVisible: false,
        localSavedAt: null,
        syncedWithRemote: true,
      }).kind,
      "published",
    );

    assert.equal(
      computeDocumentStatus({
        isDirty: false,
        publishing: false,
        restorePromptVisible: false,
        localSavedAt: null,
        syncedWithRemote: false,
      }).kind,
      "idle",
    );

    assert.equal(
      shouldShowDocumentStatus({
        kind: "idle",
        savedAt: null,
      }),
      false,
    );

    assert.equal(
      computeDocumentStatus({
        isDirty: true,
        publishing: false,
        restorePromptVisible: false,
        localSavedAt: "2026-06-08T10:00:00.000Z",
        syncedWithRemote: false,
      }).kind,
      "saved-locally",
    );

    assert.equal(
      computeDocumentStatus({
        isDirty: true,
        publishing: false,
        restorePromptVisible: false,
        localSavedAt: null,
        syncedWithRemote: false,
      }).kind,
      "unsaved",
    );
  });

  it("formats status and autosave context labels", () => {
    const status = computeDocumentStatus({
      isDirty: true,
      publishing: false,
      restorePromptVisible: false,
      localSavedAt: "2026-06-08T10:00:00.000Z",
      syncedWithRemote: false,
    });

    assert.match(documentStatusLabel(status), /^Saved locally · /);

    const record = createAutosaveRecord({
      form: { ...createInitialFormState(), title: "My draft" },
      editingPath: "src/content/blog/my-draft.mdx",
      slugAuto: false,
    });

    assert.match(autosaveContextLabel(record), /^Editing /);
    assert.equal(
      autosaveContextLabel({
        ...record,
        editingPath: null,
      }),
      "New article",
    );
  });
});
