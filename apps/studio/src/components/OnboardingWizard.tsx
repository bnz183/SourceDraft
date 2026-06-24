import { useEffect, useMemo, useState } from "react";
import {
  friendlyConfidenceLabel,
  friendlyDetectionHeadline,
  friendlyMediaLocation,
  friendlyPostsLocation,
  friendlySchemaSummary,
  friendlyWhyWeThinkSo,
} from "../lib/detectionCopy.js";
import {
  createTestDraftDefaults,
  detectionChoices,
  markOnboardingComplete,
  nextOnboardingStep,
  ONBOARDING_STEP_ORDER,
  onboardingStepLabel,
  pickDetectionSuggestion,
  previousOnboardingStep,
  type OnboardingStepId,
} from "../lib/onboardingWizard.js";
import {
  fetchSetupDetection,
  generateSetupConfig,
  type SetupDetectionReport,
} from "../lib/setupDetection.js";

type OnboardingWizardProps = {
  demoAvailable: boolean;
  defaultCategory: string | undefined;
  onComplete: (options: { openEditor: boolean; testDraft: boolean }) => void;
  onConfigApplied: () => void | Promise<void>;
  onEnterDemo: () => void;
  onApplyTestDraft: (draft: ReturnType<typeof createTestDraftDefaults>) => void;
};

export function OnboardingWizard({
  demoAvailable,
  defaultCategory,
  onComplete,
  onConfigApplied,
  onEnterDemo,
  onApplyTestDraft,
}: OnboardingWizardProps) {
  const [step, setStep] = useState<OnboardingStepId>("welcome");
  const [report, setReport] = useState<SetupDetectionReport | null>(null);
  const [detectionError, setDetectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [resolvedAttempt, setResolvedAttempt] = useState(-1);
  const [selectedAdapter, setSelectedAdapter] = useState<string | null>(null);
  const [selectedContentRoot, setSelectedContentRoot] = useState<string | null>(
    null,
  );
  const [applyStatus, setApplyStatus] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  const activeSuggestion = useMemo(
    () => pickDetectionSuggestion(report, selectedAdapter),
    [report, selectedAdapter],
  );

  const contentRoot =
    selectedContentRoot ??
    activeSuggestion?.contentRoot ??
    activeSuggestion?.contentDir ??
    null;

  // "attempted" is tracked by resolvedAttempt (set only when a fetch settles),
  // kept distinct from the result so a failed scan does not re-arm the effect.
  const detectionStatus: "idle" | "loading" | "loaded" | "error" =
    step !== "detect-site"
      ? "idle"
      : resolvedAttempt !== retryCount
        ? "loading"
        : detectionError
          ? "error"
          : "loaded";

  useEffect(() => {
    if (step !== "detect-site" || resolvedAttempt === retryCount) {
      return;
    }

    let ignore = false;
    void fetchSetupDetection().then((next) => {
      if (ignore) {
        return;
      }

      if (next === null) {
        setDetectionError(true);
        setResolvedAttempt(retryCount);
        return;
      }

      setReport(next);
      setDetectionError(false);
      setResolvedAttempt(retryCount);
      if (next.primary) {
        setSelectedAdapter(next.primary.adapter);
        setSelectedContentRoot(next.primary.contentRoot);
      }
    });

    return () => {
      ignore = true;
    };
  }, [step, retryCount, resolvedAttempt]);

  const choices = detectionChoices(report);
  const ambiguous = report?.primary !== null && report?.safeToApply !== true;

  async function handleApplySettings(): Promise<boolean> {
    if (!activeSuggestion || report?.configExists || configSaved) {
      return configSaved;
    }

    setApplying(true);
    setApplyStatus(null);
    setApplyError(null);

    const result = await generateSetupConfig({
      adapter: selectedAdapter ?? activeSuggestion.adapter,
      contentRoot: contentRoot ?? undefined,
    });
    setApplying(false);

    if (!result.ok) {
      setApplyError(result.error);
      return false;
    }

    setConfigSaved(true);
    setApplyStatus("Saved your site settings.");
    const refreshed = await fetchSetupDetection();
    setReport(refreshed);
    await onConfigApplied();
    return true;
  }

  async function handleNext(): Promise<void> {
    if (
      step === "confirm-media" &&
      !configSaved &&
      !report?.configExists &&
      activeSuggestion
    ) {
      const saved = await handleApplySettings();
      if (!saved) {
        return;
      }
    }

    const next = nextOnboardingStep(step);
    if (!next) {
      return;
    }

    setStep(next);
  }

  function handleBack(): void {
    const previous = previousOnboardingStep(step);
    if (!previous) {
      return;
    }

    setStep(previous);
  }

  function handleFinish(openEditor: boolean): void {
    markOnboardingComplete();
    onComplete({ openEditor, testDraft: step === "open-editor" });
  }

  function handleCreateTestDraft(): void {
    const draft = createTestDraftDefaults(defaultCategory);
    onApplyTestDraft(draft);
    setStep("open-editor");
  }

  return (
    <div
      className="onboarding-wizard"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-wizard-title"
    >
      <div className="onboarding-wizard__shell">
        <header className="onboarding-wizard__header">
          <p className="onboarding-wizard__eyebrow">First-time setup</p>
          <h1 className="onboarding-wizard__title" id="onboarding-wizard-title">
            {onboardingStepLabel(step)}
          </h1>
          <ol className="onboarding-wizard__steps" aria-label="Setup progress">
            {ONBOARDING_STEP_ORDER.map((stepId) => {
              const currentIndex = ONBOARDING_STEP_ORDER.indexOf(step);
              const stepIndex = ONBOARDING_STEP_ORDER.indexOf(stepId);
              const state =
                stepIndex < currentIndex
                  ? "complete"
                  : stepIndex === currentIndex
                    ? "current"
                    : "upcoming";

              return (
                <li
                  key={stepId}
                  className={`onboarding-wizard__step onboarding-wizard__step--${state}`}
                  aria-current={state === "current" ? "step" : undefined}
                >
                  <span className="onboarding-wizard__step-label">
                    {onboardingStepLabel(stepId)}
                  </span>
                </li>
              );
            })}
          </ol>
        </header>

        <div className="onboarding-wizard__body">
          {step === "welcome" && (
            <>
              <p className="onboarding-wizard__lead">
                SourceDraft helps you write, preview, and send articles to your
                blog. We will scan your project, confirm where content lives, and
                get you writing quickly.
              </p>
              <ul className="onboarding-wizard__bullets">
                <li>Detect your site type automatically</li>
                <li>Confirm folders and article fields in plain language</li>
                <li>Create a test draft and open the editor</li>
              </ul>
            </>
          )}

          {step === "detect-site" && (
            <>
              {detectionStatus === "loading" && (
                <p className="onboarding-wizard__status" role="status">
                  Scanning your project…
                </p>
              )}

              {detectionStatus === "error" && (
                <div className="notice notice--error" role="alert">
                  <p className="notice__title">Could not scan your project</p>
                  <p className="notice__body">
                    Confirm the publish service is running, then try again.
                  </p>
                  <button
                    type="button"
                    className="button button--compact"
                    onClick={() => setRetryCount((count) => count + 1)}
                  >
                    Try again
                  </button>
                </div>
              )}

              {detectionStatus === "loaded" && report && !report.primary && (
                <div className="notice notice--warning" role="status">
                  <p className="notice__title">We could not detect your site</p>
                  <p className="notice__body">
                    {report.failureMessage ??
                      "Choose a supported site type manually in Settings, or try demo mode first."}
                  </p>
                </div>
              )}

              {detectionStatus === "loaded" && report && activeSuggestion && (
                <>
                  <p className="onboarding-wizard__lead">
                    {friendlyDetectionHeadline(activeSuggestion)}
                  </p>
                  <p className="onboarding-wizard__copy">
                    {friendlyPostsLocation(activeSuggestion)}
                  </p>
                  <p className="onboarding-wizard__copy">
                    <span
                      className={`status-badge status-badge--${
                        activeSuggestion.confidence >= 70 ? "ok" : "idle"
                      }`}
                    >
                      {friendlyConfidenceLabel(activeSuggestion.confidence)}
                    </span>
                  </p>
                  <p className="onboarding-wizard__copy">
                    {friendlyWhyWeThinkSo(activeSuggestion)}
                  </p>

                  {ambiguous && choices.length > 1 && (
                    <fieldset className="onboarding-wizard__choices">
                      <legend className="onboarding-wizard__choices-legend">
                        Choose the closest match
                      </legend>
                      {choices.map((choice) => (
                        <label
                          key={choice.adapter}
                          className="onboarding-wizard__choice"
                        >
                          <input
                            type="radio"
                            name="detected-site-type"
                            checked={selectedAdapter === choice.adapter}
                            onChange={() => {
                              setSelectedAdapter(choice.adapter);
                              setSelectedContentRoot(choice.contentRoot);
                            }}
                          />
                          <span>
                            {choice.framework} ({friendlyConfidenceLabel(choice.confidence)})
                          </span>
                        </label>
                      ))}
                    </fieldset>
                  )}

                  {report.warnings.length > 0 && (
                    <ul className="onboarding-wizard__warnings">
                      {report.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  )}

                  {report.configExists ? (
                    <p className="onboarding-wizard__hint" role="status">
                      Your site settings file already exists — we will not overwrite
                      it without your confirmation in Advanced settings.
                    </p>
                  ) : (
                    !configSaved && (
                      <div className="onboarding-wizard__apply">
                        <button
                          type="button"
                          className="button button--primary"
                          disabled={applying}
                          onClick={() => {
                            void handleApplySettings();
                          }}
                        >
                          {applying
                            ? "Saving settings…"
                            : report.safeToApply
                              ? "Use these settings"
                              : "Save my choices"}
                        </button>
                        {!report.safeToApply && (
                          <p className="onboarding-wizard__hint">
                            We found more than one possible match — confirm your
                            choice above, then save.
                          </p>
                        )}
                        {applyStatus && (
                          <p className="onboarding-wizard__status" role="status">
                            {applyStatus}
                          </p>
                        )}
                        {applyError && (
                          <p className="onboarding-wizard__error" role="alert">
                            {applyError}
                          </p>
                        )}
                      </div>
                    )
                  )}

                  {configSaved && (
                    <p className="onboarding-wizard__status" role="status">
                      Site settings saved. Continue to confirm folders and create a
                      test draft.
                    </p>
                  )}

                  <details className="onboarding-wizard__advanced">
                    <summary>Advanced details</summary>
                    <dl className="onboarding-wizard__facts">
                      <div>
                        <dt>Format</dt>
                        <dd>{activeSuggestion.adapter}</dd>
                      </div>
                      <div>
                        <dt>Scanned folder</dt>
                        <dd>{report.scannedRoot}</dd>
                      </div>
                    </dl>
                  </details>
                </>
              )}
            </>
          )}

          {step === "confirm-content" && activeSuggestion && (
            <>
              <p className="onboarding-wizard__lead">Where your posts live</p>
              <p className="onboarding-wizard__copy">
                {friendlyPostsLocation(activeSuggestion)}
              </p>
              {activeSuggestion.contentRootCandidates.length > 1 && (
                <fieldset className="onboarding-wizard__choices">
                  <legend className="onboarding-wizard__choices-legend">
                    Pick the articles folder
                  </legend>
                  {activeSuggestion.contentRootCandidates.map((candidate) => (
                    <label key={candidate} className="onboarding-wizard__choice">
                      <input
                        type="radio"
                        name="content-root"
                        checked={contentRoot === candidate}
                        onChange={() => setSelectedContentRoot(candidate)}
                      />
                      <span>{candidate}</span>
                    </label>
                  ))}
                </fieldset>
              )}
              {!activeSuggestion.contentRootCandidates.length && contentRoot && (
                <p className="onboarding-wizard__hint">{contentRoot}</p>
              )}
            </>
          )}

          {step === "confirm-schema" && activeSuggestion && (
            <>
              <p className="onboarding-wizard__lead">Article fields</p>
              <p className="onboarding-wizard__copy">
                {friendlySchemaSummary(activeSuggestion)}
              </p>
              {activeSuggestion.frontmatter?.suggestedCategories &&
                activeSuggestion.frontmatter.suggestedCategories.length > 0 && (
                  <p className="onboarding-wizard__hint">
                    Suggested categories:{" "}
                    {activeSuggestion.frontmatter.suggestedCategories.join(", ")}
                  </p>
                )}
            </>
          )}

          {step === "confirm-media" && activeSuggestion && (
            <>
              <p className="onboarding-wizard__lead">Images and files</p>
              <p className="onboarding-wizard__copy">
                {friendlyMediaLocation(activeSuggestion)}
              </p>
            </>
          )}

          {step === "create-draft" && (
            <>
              <p className="onboarding-wizard__lead">
                Create a test draft
              </p>
              <p className="onboarding-wizard__copy">
                We will add a sample draft so you can try the editor, preview, and
                publishing checklist without touching live content.
              </p>
            </>
          )}

          {step === "open-editor" && (
            <>
              <p className="onboarding-wizard__lead">You are ready to write</p>
              <p className="onboarding-wizard__copy">
                Open the editor to finish your test draft or start a new article.
                You can return to the dashboard any time from the left navigation.
              </p>
            </>
          )}
        </div>

        <footer className="onboarding-wizard__footer">
          <div className="onboarding-wizard__footer-start">
            {demoAvailable && (
              <button
                type="button"
                className="button button--compact"
                onClick={onEnterDemo}
              >
                Try demo mode
              </button>
            )}
            {step !== "welcome" && (
              <button type="button" className="button button--compact" onClick={handleBack}>
                Back
              </button>
            )}
          </div>

          <div className="onboarding-wizard__footer-end">
            <button
              type="button"
              className="button button--compact onboarding-wizard__skip"
              onClick={() => handleFinish(false)}
            >
              Skip for now
            </button>

            {step === "create-draft" && (
              <button
                type="button"
                className="button button--primary"
                onClick={handleCreateTestDraft}
              >
                Create test draft
              </button>
            )}

            {step === "open-editor" && (
              <button
                type="button"
                className="button button--primary"
                onClick={() => handleFinish(true)}
              >
                Open editor
              </button>
            )}

            {step !== "create-draft" && step !== "open-editor" && (
              <button
                type="button"
                className="button button--primary"
                disabled={
                  applying ||
                  (step === "detect-site" &&
                    (detectionStatus === "loading" ||
                      detectionStatus === "error" ||
                      (report !== null && !report.primary)))
                }
                onClick={() => {
                  void handleNext();
                }}
              >
                Continue
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
