type DemoBannerProps = {
  forced?: boolean;
};

export function DemoBanner({ forced = false }: DemoBannerProps) {
  return (
    <div className="demo-banner" role="status">
      <p className="demo-banner__title">
        Demo mode — explore without connecting a real blog
      </p>
      <p className="demo-banner__body">
        {forced
          ? "This Studio is running in demo mode. No real posts are published and sample content resets when the server restarts."
          : "You are exploring sample articles locally. Sending to your blog and image uploads are simulated only — safe to click around."}
      </p>
    </div>
  );
}
