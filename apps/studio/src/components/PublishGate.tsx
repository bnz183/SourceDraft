import type { PublishMode } from "@sourcedraft/publishers";

type PublishGateProps = {
  ready: boolean;
  publishing: boolean;
  publishError: string | null;
  publishSuccess: string | null;
  publishSuccessUrl: string | null;
  githubReady: boolean;
  demoMode: boolean;
  publishMode: PublishMode;
  defaultPublishMode: PublishMode;
  baseBranch: string;
  outputPath: string | null;
  prBranchPreview: string | null;
  prModeSupported: boolean;
  onPublishModeChange: (mode: PublishMode) => void;
  onPublish: () => void;
};

const PUBLISH_MODE_OPTIONS: { value: PublishMode; label: string }[] = [
  { value: "direct", label: "Direct commit" },
  { value: "pull-request", label: "Pull request" },
  { value: "draft-pull-request", label: "Draft pull request" },
];

function publishModeLabel(mode: PublishMode): string {
  return (
    PUBLISH_MODE_OPTIONS.find((option) => option.value === mode)?.label ?? mode
  );
}

function disabledReason(
  ready: boolean,
  githubReady: boolean,
  publishing: boolean,
  demoMode: boolean,
): string | null {
  if (publishing) {
    return null;
  }

  if (!githubReady && !demoMode) {
    return "Set GITHUB_OWNER, GITHUB_REPO, and GITHUB_TOKEN in .env, then check Settings.";
  }

  if (!ready) {
    return "Fix validation issues in Post details before publishing.";
  }

  return null;
}

function publishStatusCopy(
  publishing: boolean,
  ready: boolean,
  demoMode: boolean,
  publishMode: PublishMode,
): string {
  if (publishing) {
    if (demoMode) {
      return publishMode === "direct"
        ? "Simulating direct publish…"
        : "Simulating pull request publish…";
    }

    return publishMode === "direct"
      ? "Saving to GitHub…"
      : "Creating pull request on GitHub…";
  }

  if (!ready) {
    return "Complete required fields to enable publish";
  }

  if (demoMode) {
    return publishMode === "direct"
      ? "Demo mode will simulate a direct commit publish"
      : "Demo mode will simulate a pull request publish";
  }

  return publishMode === "direct"
    ? "Your post will be committed to the repository"
    : "Your post will be committed to a SourceDraft branch and opened as a pull request";
}

function publishButtonLabel(
  publishing: boolean,
  demoMode: boolean,
  publishMode: PublishMode,
): string {
  if (publishing) {
    return "Publishing…";
  }

  if (demoMode) {
    return publishMode === "direct" ? "Simulate publish" : "Simulate PR publish";
  }

  return publishMode === "direct" ? "Publish to GitHub" : "Publish as pull request";
}

export function PublishGate({
  ready,
  publishing,
  publishError,
  publishSuccess,
  publishSuccessUrl,
  githubReady,
  demoMode,
  publishMode,
  defaultPublishMode,
  baseBranch,
  outputPath,
  prBranchPreview,
  prModeSupported,
  onPublishModeChange,
  onPublish,
}: PublishGateProps) {
  const canPublish = ready && !publishing && (githubReady || demoMode);
  const reason = disabledReason(ready, githubReady, publishing, demoMode);

  return (
    <section className="publish-bar" aria-labelledby="publish-bar-title">
      <div className="publish-bar__main">
        <div className="publish-bar__copy">
          <h2 className="publish-bar__title" id="publish-bar-title">
            Publish
          </h2>
          <p className="publish-bar__meta" aria-live="polite">
            {publishStatusCopy(publishing, ready, demoMode, publishMode)}
          </p>
        </div>
        <button
          type="button"
          className="button button--primary publish-bar__button"
          disabled={!canPublish}
          aria-describedby={reason ? "publish-disabled-reason" : undefined}
          onClick={onPublish}
        >
          {publishButtonLabel(publishing, demoMode, publishMode)}
        </button>
      </div>

      <div className="publish-bar__settings">
        <label className="publish-bar__field" htmlFor="publish-mode-select">
          Publish mode
        </label>
        <select
          id="publish-mode-select"
          className="publish-bar__select"
          value={publishMode}
          disabled={publishing}
          onChange={(event) =>
            onPublishModeChange(event.target.value as PublishMode)
          }
        >
          {PUBLISH_MODE_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.value !== "direct" && !prModeSupported}
            >
              {option.label}
            </option>
          ))}
        </select>
        {defaultPublishMode !== publishMode && (
          <p className="publish-bar__hint">
            Server default: {publishModeLabel(defaultPublishMode)}
          </p>
        )}
      </div>

      <dl className="publish-bar__details">
        <div>
          <dt>Target branch</dt>
          <dd>{baseBranch}</dd>
        </div>
        <div>
          <dt>Output path</dt>
          <dd>{outputPath ?? "—"}</dd>
        </div>
        {publishMode !== "direct" && (
          <div>
            <dt>PR branch</dt>
            <dd>{prBranchPreview ?? "—"}</dd>
          </div>
        )}
      </dl>

      {reason && (
        <p className="publish-bar__hint" id="publish-disabled-reason">
          {reason}
        </p>
      )}

      {!prModeSupported && publishMode !== "direct" && (
        <p className="publish-bar__hint" role="status">
          Pull request publish is only available for the GitHub publisher.
        </p>
      )}

      {publishError && (
        <div className="notice notice--error publish-bar__notice" role="alert">
          <p className="notice__title">Publish failed</p>
          <p className="notice__body">{publishError}</p>
          <p className="notice__hint">
            Check Settings for GitHub and path configuration, then try again.
          </p>
        </div>
      )}

      {publishSuccess && (
        <div className="notice notice--success publish-bar__notice" role="status">
          <p className="notice__title">
            {demoMode
              ? publishMode === "direct"
                ? "Publish simulated"
                : "Pull request simulated"
              : publishMode === "direct"
                ? "Published successfully"
                : "Pull request created"}
          </p>
          <p className="notice__body">
            {publishSuccessUrl ? (
              <a href={publishSuccessUrl} target="_blank" rel="noreferrer">
                {publishSuccess}
              </a>
            ) : (
              publishSuccess
            )}
          </p>
          <p className="notice__hint">
            {demoMode
              ? publishMode === "direct"
                ? "No GitHub commit was made. Configure GitHub in .env for real publishing."
                : "No GitHub pull request was created. Configure GitHub in .env for real PR publishing."
              : publishMode === "direct"
                ? "Your site build or CI will pick up the file from the repository."
                : "Merge the pull request to update the base branch and trigger your normal deploy flow."}
          </p>
        </div>
      )}
    </section>
  );
}
