import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  autosaveToSnapshot,
  clearAutosave,
  computeDocumentStatus,
  loadAutosave,
  saveAutosave,
  snapshotsEqual,
  type AutosaveRecord,
  type DocumentSnapshot,
  type DocumentStatus,
} from "../lib/autosave.js";

const AUTOSAVE_DEBOUNCE_MS = 800;

type CommitBaselineOptions = {
  remoteSync: boolean;
  clearLocalDraft: boolean;
};

type UseDocumentAutosaveOptions = {
  snapshot: DocumentSnapshot;
  publishing: boolean;
  enabled: boolean;
};

type UseDocumentAutosaveResult = {
  documentStatus: DocumentStatus;
  restorePrompt: AutosaveRecord | null;
  applyRestore: () => DocumentSnapshot | null;
  discardDraft: () => void;
  commitBaseline: (
    baseline: DocumentSnapshot,
    options: CommitBaselineOptions,
  ) => void;
  checkRestorePrompt: (current: DocumentSnapshot) => void;
};

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function useDocumentAutosave({
  snapshot,
  publishing,
  enabled,
}: UseDocumentAutosaveOptions): UseDocumentAutosaveResult {
  const [baseline, setBaseline] = useState<DocumentSnapshot>(snapshot);
  const [localSavedAt, setLocalSavedAt] = useState<string | null>(null);
  const [syncedWithRemote, setSyncedWithRemote] = useState(false);
  const [restorePrompt, setRestorePrompt] = useState<AutosaveRecord | null>(
    null,
  );
  const restoreDismissedRef = useRef(false);
  const autosaveTimerRef = useRef<number | null>(null);
  const initialCheckDoneRef = useRef(false);

  const isDirty = useMemo(
    () => !snapshotsEqual(snapshot, baseline),
    [snapshot, baseline],
  );

  const checkRestorePrompt = useCallback((current: DocumentSnapshot) => {
    if (restoreDismissedRef.current) {
      return;
    }

    const storage = getStorage();
    if (!storage) {
      return;
    }

    const autosave = loadAutosave(storage);
    if (!autosave) {
      setRestorePrompt(null);
      return;
    }

    if (snapshotsEqual(autosaveToSnapshot(autosave), current)) {
      setRestorePrompt(null);
      setLocalSavedAt(autosave.savedAt);
      return;
    }

    setRestorePrompt(autosave);
  }, []);

  const commitBaseline = useCallback(
    (baseline: DocumentSnapshot, options: CommitBaselineOptions) => {
      setBaseline({
        form: { ...baseline.form },
        editingPath: baseline.editingPath,
        slugAuto: baseline.slugAuto,
      });
      setSyncedWithRemote(options.remoteSync);
      setLocalSavedAt(null);
      setRestorePrompt(null);
      restoreDismissedRef.current = false;

      const storage = getStorage();
      if (storage && options.clearLocalDraft) {
        clearAutosave(storage);
      }
    },
    [],
  );

  useEffect(() => {
    if (!enabled || initialCheckDoneRef.current) {
      return;
    }

    initialCheckDoneRef.current = true;
    checkRestorePrompt(snapshot);
  }, [checkRestorePrompt, enabled, snapshot]);

  useEffect(() => {
    if (!enabled || !isDirty) {
      return;
    }

    const storage = getStorage();
    if (!storage) {
      return;
    }

    if (autosaveTimerRef.current !== null) {
      window.clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = window.setTimeout(() => {
      const record = saveAutosave(storage, snapshot);
      setLocalSavedAt(record.savedAt);
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (autosaveTimerRef.current !== null) {
        window.clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [enabled, isDirty, snapshot]);

  useEffect(() => {
    if (!enabled || !isDirty) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, isDirty]);

  const applyRestore = useCallback((): DocumentSnapshot | null => {
    if (!restorePrompt) {
      return null;
    }

    const restored = autosaveToSnapshot(restorePrompt);
    setRestorePrompt(null);
    restoreDismissedRef.current = true;
    setLocalSavedAt(restorePrompt.savedAt);
    setSyncedWithRemote(false);
    return restored;
  }, [restorePrompt]);

  const discardDraft = useCallback(() => {
    const storage = getStorage();
    if (storage) {
      clearAutosave(storage);
    }

    setRestorePrompt(null);
    restoreDismissedRef.current = true;
    setLocalSavedAt(null);
  }, []);

  const documentStatus = useMemo(
    () =>
      computeDocumentStatus({
        isDirty,
        publishing,
        restorePromptVisible: restorePrompt !== null,
        localSavedAt,
        syncedWithRemote,
      }),
    [isDirty, publishing, restorePrompt, localSavedAt, syncedWithRemote],
  );

  return {
    documentStatus,
    restorePrompt,
    applyRestore,
    discardDraft,
    commitBaseline,
    checkRestorePrompt,
  };
}

export type { DocumentSnapshot, DocumentStatus };
