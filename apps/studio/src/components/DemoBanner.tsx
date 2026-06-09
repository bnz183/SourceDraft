type DemoBannerProps = {
  forced?: boolean;
};

export function DemoBanner({ forced = false }: DemoBannerProps) {
  return (
    <div className="demo-banner" role="status">
      <p className="demo-banner__title">Demo mode — no GitHub commits are made</p>
      <p className="demo-banner__body">
        {forced
          ? "This Studio instance is running with SOURCEDRAFT_DEMO_MODE enabled."
          : "You are exploring sample posts locally. Publish and uploads are simulated only."}
      </p>
    </div>
  );
}
