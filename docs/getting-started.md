# Getting started

You need a GitHub repository for your **site** (for example an Astro blog) that reads posts from a folder such as `src/content/blog`.

## 1. Install SourceDraft

```bash
git clone https://github.com/bnz183/SourceDraft.git
cd SourceDraft
pnpm install
```

## 2. Project settings (`sourcedraft.config.json`)

```bash
cp sourcedraft.config.example.json sourcedraft.config.json
```

Edit paths and categories to match your site. These values are safe to commit.

## 3. Secrets (`.env`)

```bash
cp .env.example .env
```

```env
SOURCEDRAFT_ADMIN_PASSWORD=your-local-studio-password
GITHUB_TOKEN=ghp_...
GITHUB_OWNER=your-username-or-org
GITHUB_REPO=your-site-repo
GITHUB_BRANCH=main
```

| File | Holds |
|------|--------|
| `sourcedraft.config.json` | `contentDir`, categories, adapter |
| `.env` | Password, GitHub token, repo owner/name |

See [configuration.md](configuration.md) for the full split.

### GitHub token

Create a token with permission to read and write **contents** in the target repository. SourceDraft uses it on the server when you publish — not in the browser.

## 4. Run Studio

```bash
pnpm dev
```

Starts the editor and publish API (default API port `8787`). Use this command, not `dev:web` alone, or publish will fail.

Sign in with `SOURCEDRAFT_ADMIN_PASSWORD`.

## 5. Write and publish

1. **New Article** — fill in the form
2. Check MDX preview and output path
3. **Publish to GitHub**

SourceDraft validates, builds MDX, and commits to `contentDir/<slug>.mdx`.

How that commit works: [github-publishing.md](github-publishing.md)

## 6. Verify

Open your site repo on GitHub and confirm the new file. Run your usual site build or wait for CI.

## Astro layout example

[examples/astro-blog](../examples/astro-blog/) shows expected folders and a sample MDX file. It is an integration reference, not a complete Astro app.

## Troubleshooting

| Problem | Likely cause |
|---------|----------------|
| Cannot sign in | `SOURCEDRAFT_ADMIN_PASSWORD` missing; restart API after editing `.env` |
| Publish API unreachable | Run `pnpm dev`, not UI-only |
| GitHub 401 / 403 | Token scope or wrong owner/repo |
| Wrong file path | `contentDir` in config |

Plain-language intro: [non-technical-overview.md](non-technical-overview.md)
