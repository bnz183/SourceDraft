export type PublishEnvConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  contentDir: string;
  adapter: string;
};

export type PublishEnvResult =
  | { ok: true; config: PublishEnvConfig }
  | { ok: false; error: string };

export function loadPublishEnv(): PublishEnvResult {
  const token = process.env.GITHUB_TOKEN?.trim();
  const owner = process.env.GITHUB_OWNER?.trim();
  const repo = process.env.GITHUB_REPO?.trim();
  const branch = process.env.GITHUB_BRANCH?.trim() || "main";
  const contentDir =
    process.env.CMS_CONTENT_DIR?.trim() || "src/content/blog";
  const adapter = process.env.CMS_ADAPTER?.trim() || "astro-mdx";

  if (!token) {
    return { ok: false, error: "GITHUB_TOKEN is not configured." };
  }

  if (!owner) {
    return { ok: false, error: "GITHUB_OWNER is not configured." };
  }

  if (!repo) {
    return { ok: false, error: "GITHUB_REPO is not configured." };
  }

  if (adapter !== "astro-mdx") {
    return {
      ok: false,
      error: `Unsupported CMS_ADAPTER "${adapter}". Only astro-mdx is supported.`,
    };
  }

  return {
    ok: true,
    config: {
      token,
      owner,
      repo,
      branch,
      contentDir,
      adapter,
    },
  };
}
