import { DEMO_DEFAULT_PASSWORD } from "../lib/demoDefaults";

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
          : "You are exploring sample posts locally. Publish and uploads are simulated only."}{" "}
        Default password is <code>{DEMO_DEFAULT_PASSWORD}</code> — change{" "}
        <code>SOURCEDRAFT_ADMIN_PASSWORD</code> in <code>.env</code> before production use.
      </p>
    </div>
  );
}
