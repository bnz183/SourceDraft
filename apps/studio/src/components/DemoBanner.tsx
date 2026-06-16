type DemoBannerProps = {
  forced?: boolean;
  onExitDemo?: () => void;
};

export function DemoBanner({ forced = false, onExitDemo }: DemoBannerProps) {
  return (
    <div className="demo-banner" role="status">
      <div className="demo-banner__content">
        <p className="demo-banner__title">
          Demo mode — explore without connecting a real blog
        </p>
        <p className="demo-banner__body">
          {forced
            ? "This Studio is running in demo mode. No real posts are published and sample content resets when the server restarts."
            : "You are exploring sample articles locally. Sending to your blog and image uploads are simulated only — safe to click around."}
        </p>
      </div>
      {!forced && onExitDemo && (
        <button
          type="button"
          className="button button--compact demo-banner__exit"
          onClick={onExitDemo}
        >
          Exit demo mode
        </button>
      )}
    </div>
  );
}
