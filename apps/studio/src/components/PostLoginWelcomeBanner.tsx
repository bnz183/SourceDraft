import { useState } from "react";

const DISMISS_KEY = "sourcedraft-post-login-welcome-dismissed";

type PostLoginWelcomeBannerProps = {
  demoMode: boolean;
  githubReady: boolean;
  onOpenSettings: () => void;
};

export function PostLoginWelcomeBanner({
  demoMode,
  githubReady,
  onOpenSettings,
}: PostLoginWelcomeBannerProps) {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === "true",
  );

  if (dismissed) {
    return null;
  }

  function handleDismiss(): void {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  }

  return (
    <div className="post-login-welcome" role="status">
      <div className="post-login-welcome__copy">
        <p className="post-login-welcome__title">Quick start</p>
        <p className="post-login-welcome__body">
          Pick an article or click <strong>New article</strong>, fill in the
          fields, preview the output, then <strong>Send to your blog</strong>.
          {demoMode
            ? " Demo mode is active — nothing is published to a real blog."
            : !githubReady
              ? " Publishing is not connected yet — you can still write and preview."
              : ""}
        </p>
        <ul className="post-login-welcome__tips">
          <li>
            <strong>Connect a blog:</strong> open the Dashboard or Settings to
            run the setup wizard and finish connecting your site.
          </li>
          <li>
            <strong>Agent-ready workflow:</strong> structured article fields,
            validation, preview, and human review before sending — built-in AI
            is not shipped yet.
          </li>
        </ul>
      </div>
      <div className="post-login-welcome__actions">
        <button
          type="button"
          className="button button--compact"
          onClick={onOpenSettings}
        >
          Open Settings
        </button>
        <button
          type="button"
          className="button button--compact post-login-welcome__dismiss"
          onClick={handleDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
