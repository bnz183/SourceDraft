import type { PublishMode } from "@sourcedraft/publishers";
import type { ValidationIssue } from "@sourcedraft/core";
import type { ArticleFormState } from "../lib/articleForm";
import { canSubmitPublish } from "../lib/publishGate";
import { PublishChecklist } from "./PublishChecklist";

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
  validationIssues: ValidationIssue[];
  formValues: ArticleFormState;
  knownPostSlugs: string[];
  onPublishModeChange: (mode: PublishMode) => void;
  onPublish: () => void;
};

const PUBLISH_MODE_OPTIONS: { value: PublishMode; label: string }[] = [
  { value: "direct", label: "Send directly" },
  { value: "pull-request", label: "Review request" },
  { value: "draft-pull-request", label: "Draft review request" },
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
    return "Your blog is not connected yet. Open Settings and review publishing readiness.";
  }

  if (!ready) {
    return "Complete the required article fields before sending to your blog.";
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
        ? "Simulating send to your blog…"
        : "Simulating review request…";
    }

    return publishMode === "direct"
      ? "Sending to your blog…"
      : "Creating review request…";
  }

  if (!ready) {
    return "Complete required fields to send this article to your blog";
  }

  if (demoMode) {
    return publishMode === "direct"
      ? "Demo mode will simulate sending this article to your blog"
      : "Demo mode will simulate opening a review request on your blog repository";
  }

  return publishMode === "direct"
    ? "This article will be sent to your connected blog"
    : "This article will be saved on a review branch and opened as a pull request";
}

function publishButtonLabel(
  publishing: boolean,
  demoMode: boolean,
  publishMode: PublishMode,
): string {
  if (publishing) {
    return "Sending…";
  }

  if (demoMode) {
    return publishMode === "direct" ? "Simulate send to blog" : "Simulate review request";
  }

  return publishMode === "direct" ? "Send to your blog" : "Send as review request";
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
  validationIssues,
  formValues,
  knownPostSlugs,
  onPublishModeChange,
  onPublish,
}: PublishGateProps) {
  const canPublish = canSubmitPublish({ ready, publishing, githubReady, demoMode });
  const reason = disabledReason(ready, githubReady, publishing, demoMode);

  return (
    <section className="publish-bar" aria-labelledby="publish-bar-title">
      <div className="publish-bar__main">
        <div className="publish-bar__copy">
          <h2 className="publish-bar__title" id="publish-bar-title">
            Send to your blog
          </h2>
          <p className="publish-bar__meta" aria-live="polite">
            {publishStatusCopy(publishing, ready, demoMode, publishMode)}
          </p>
        </div>
        <button
          type="button"
          className="button button--primary button--lg publish-bar__button"
          disabled={!canPublish}
          aria-describedby={reason ? "publish-disabled-reason" : undefined}
          onClick={onPublish}
        >
          {publishButtonLabel(publishing, demoMode, publishMode)}
        </button>
      </div>

      <div className="publish-bar__settings">
        <label className="publish-bar__field" htmlFor="publish-mode-select">
          How to send
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

      <PublishChecklist
        valid={ready}
        issues={validationIssues}
        values={formValues}
        outputPath={outputPath}
        publishMode={publishMode}
        baseBranch={baseBranch}
        prBranchPreview={prBranchPreview}
        knownPostSlugs={knownPostSlugs}
      />

      {reason && (
        <p className="publish-bar__hint" id="publish-disabled-reason">
          {reason}
        </p>
      )}

      {!prModeSupported && publishMode !== "direct" && (
        <p className="publish-bar__hint" role="status">
          Review requests are only available when publishing to GitHub.
        </p>
      )}

      {publishError && (
        <div className="notice notice--error publish-bar__notice" role="alert">
          <p className="notice__title">Could not send to your blog</p>
          <p className="notice__body">{publishError}</p>
          <p className="notice__hint">
            Open Settings, review publishing readiness, then try again.
          </p>
        </div>
      )}

      {publishSuccess && (
        <div className="notice notice--success publish-bar__notice" role="status">
          <p className="notice__title">
            {demoMode
              ? publishMode === "direct"
                ? "Send simulated"
                : "Review request simulated"
              : publishMode === "direct"
                ? "Sent to your blog"
                : "Review request created"}
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
                ? "Nothing was sent to a real blog. Connect your blog in Settings when you are ready."
                : "No review request was created. Connect your blog in Settings when you are ready."
              : publishMode === "direct"
                ? "Your site build or deploy will pick up the new article."
                : "Merge the review request to publish the article through your normal deploy flow."}
          </p>
        </div>
      )}
    </section>
  );
}
