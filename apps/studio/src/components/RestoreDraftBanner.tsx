import {
  autosaveContextLabel,
  formatAutosaveTime,
  type AutosaveRecord,
} from "../lib/autosave.js";

type RestoreDraftBannerProps = {
  autosave: AutosaveRecord;
  onRestore: () => void;
  onDiscard: () => void;
};

export function RestoreDraftBanner({
  autosave,
  onRestore,
  onDiscard,
}: RestoreDraftBannerProps) {
  const title =
    autosave.form.title.trim().length > 0
      ? autosave.form.title.trim()
      : "Untitled draft";

  return (
    <aside className="restore-banner" role="status" aria-live="polite">
      <div className="restore-banner__content">
        <p className="restore-banner__title">Local draft available</p>
        <p className="restore-banner__meta">
          <strong>{title}</strong>
          {" · "}
          Saved {formatAutosaveTime(autosave.savedAt)}
          {" · "}
          {autosaveContextLabel(autosave)}
        </p>
      </div>
      <div className="restore-banner__actions">
        <button
          type="button"
          className="button button--compact restore-banner__action"
          onClick={onRestore}
        >
          Restore draft
        </button>
        <button
          type="button"
          className="button button--compact restore-banner__action restore-banner__action--muted"
          onClick={onDiscard}
        >
          Discard draft
        </button>
      </div>
    </aside>
  );
}
