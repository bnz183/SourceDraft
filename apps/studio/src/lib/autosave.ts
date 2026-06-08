import type { ArticleFormState } from "./articleForm.js";

export const AUTOSAVE_STORAGE_KEY = "sourcedraft.autosave.v1";

export type AutosaveRecord = {
  version: 1;
  savedAt: string;
  form: ArticleFormState;
  editingPath: string | null;
  slugAuto: boolean;
};

export type DocumentSnapshot = {
  form: ArticleFormState;
  editingPath: string | null;
  slugAuto: boolean;
};

export type DocumentStatusKind =
  | "unsaved"
  | "saved-locally"
  | "published"
  | "publishing"
  | "restore-available"
  | "idle";

export type DocumentStatus = {
  kind: DocumentStatusKind;
  savedAt: string | null;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function createAutosaveRecord(
  snapshot: DocumentSnapshot,
  savedAt = new Date().toISOString(),
): AutosaveRecord {
  return {
    version: 1,
    savedAt,
    form: { ...snapshot.form },
    editingPath: snapshot.editingPath,
    slugAuto: snapshot.slugAuto,
  };
}

export function serializeAutosave(record: AutosaveRecord): string {
  return JSON.stringify(record);
}

export function parseAutosave(raw: string): AutosaveRecord | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const candidate = parsed as Partial<AutosaveRecord>;
    if (candidate.version !== 1) {
      return null;
    }

    if (typeof candidate.savedAt !== "string" || candidate.savedAt.length === 0) {
      return null;
    }

    if (!candidate.form || typeof candidate.form !== "object") {
      return null;
    }

    const form = candidate.form as Partial<ArticleFormState>;
    const requiredStringFields = [
      "title",
      "slug",
      "description",
      "pubDate",
      "updatedDate",
      "category",
      "tags",
      "heroImage",
      "body",
    ] as const;

    for (const field of requiredStringFields) {
      if (typeof form[field] !== "string") {
        return null;
      }
    }

    if (typeof form.draft !== "boolean") {
      return null;
    }

    const editingPath =
      candidate.editingPath === null || typeof candidate.editingPath === "string"
        ? candidate.editingPath
        : null;

    if (typeof candidate.slugAuto !== "boolean") {
      return null;
    }

    return {
      version: 1,
      savedAt: candidate.savedAt,
      form: {
        title: form.title as string,
        slug: form.slug as string,
        description: form.description as string,
        pubDate: form.pubDate as string,
        updatedDate: form.updatedDate as string,
        category: form.category as string,
        tags: form.tags as string,
        draft: form.draft,
        heroImage: form.heroImage as string,
        body: form.body as string,
        author: typeof form.author === "string" ? form.author : "",
        metaTitle: typeof form.metaTitle === "string" ? form.metaTitle : "",
        metaDescription:
          typeof form.metaDescription === "string" ? form.metaDescription : "",
        canonicalUrl: typeof form.canonicalUrl === "string" ? form.canonicalUrl : "",
        socialImage: typeof form.socialImage === "string" ? form.socialImage : "",
        coverImageAlt:
          typeof form.coverImageAlt === "string" ? form.coverImageAlt : "",
        noindex: form.noindex === true,
      },
      editingPath,
      slugAuto: candidate.slugAuto,
    };
  } catch {
    return null;
  }
}

export function autosaveToSnapshot(record: AutosaveRecord): DocumentSnapshot {
  return {
    form: { ...record.form },
    editingPath: record.editingPath,
    slugAuto: record.slugAuto,
  };
}

export function snapshotsEqual(
  left: DocumentSnapshot,
  right: DocumentSnapshot,
): boolean {
  return (
    left.slugAuto === right.slugAuto &&
    left.editingPath === right.editingPath &&
    formsEqual(left.form, right.form)
  );
}

export function formsEqual(left: ArticleFormState, right: ArticleFormState): boolean {
  return (
    left.title === right.title &&
    left.slug === right.slug &&
    left.description === right.description &&
    left.pubDate === right.pubDate &&
    left.updatedDate === right.updatedDate &&
    left.category === right.category &&
    left.tags === right.tags &&
    left.draft === right.draft &&
    left.heroImage === right.heroImage &&
    left.body === right.body &&
    left.author === right.author &&
    left.metaTitle === right.metaTitle &&
    left.metaDescription === right.metaDescription &&
    left.canonicalUrl === right.canonicalUrl &&
    left.socialImage === right.socialImage &&
    left.coverImageAlt === right.coverImageAlt &&
    left.noindex === right.noindex
  );
}

export function isEmptyForm(form: ArticleFormState): boolean {
  return (
    form.title.trim().length === 0 &&
    form.slug.trim().length === 0 &&
    form.description.trim().length === 0 &&
    form.body.trim().length === 0 &&
    form.tags.trim().length === 0 &&
    form.heroImage.trim().length === 0 &&
    form.updatedDate.trim().length === 0
  );
}

export function loadAutosave(storage: StorageLike): AutosaveRecord | null {
  const raw = storage.getItem(AUTOSAVE_STORAGE_KEY);
  if (raw === null) {
    return null;
  }

  return parseAutosave(raw);
}

export function saveAutosave(
  storage: StorageLike,
  snapshot: DocumentSnapshot,
  savedAt = new Date().toISOString(),
): AutosaveRecord {
  const record = createAutosaveRecord(snapshot, savedAt);
  storage.setItem(AUTOSAVE_STORAGE_KEY, serializeAutosave(record));
  return record;
}

export function clearAutosave(storage: StorageLike): void {
  storage.removeItem(AUTOSAVE_STORAGE_KEY);
}

export function computeDocumentStatus(input: {
  isDirty: boolean;
  publishing: boolean;
  restorePromptVisible: boolean;
  localSavedAt: string | null;
  syncedWithRemote: boolean;
}): DocumentStatus {
  if (input.publishing) {
    return { kind: "publishing", savedAt: null };
  }

  if (input.restorePromptVisible) {
    return { kind: "restore-available", savedAt: input.localSavedAt };
  }

  if (input.isDirty && input.localSavedAt !== null) {
    return { kind: "saved-locally", savedAt: input.localSavedAt };
  }

  if (input.isDirty) {
    return { kind: "unsaved", savedAt: null };
  }

  if (input.syncedWithRemote) {
    return { kind: "published", savedAt: null };
  }

  return { kind: "idle", savedAt: null };
}

export function shouldShowDocumentStatus(status: DocumentStatus): boolean {
  return status.kind !== "idle" && status.kind !== "restore-available";
}

export function formatAutosaveTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function autosaveContextLabel(record: AutosaveRecord): string {
  if (record.editingPath && record.editingPath.length > 0) {
    return `Editing ${record.editingPath}`;
  }

  return "New post";
}

export function documentStatusLabel(status: DocumentStatus): string {
  switch (status.kind) {
    case "publishing":
      return "Publishing…";
    case "published":
      return "Published";
    case "saved-locally":
      return status.savedAt
        ? `Saved locally · ${formatAutosaveTime(status.savedAt)}`
        : "Saved locally";
    case "unsaved":
      return "Unsaved changes";
    case "restore-available":
      return "Local draft available";
    case "idle":
      return "";
  }
}
