# Getting started

This guide assumes you already have a static site repo on GitHub that reads Markdown or MDX content from a folder such as `src/content/blog`.

## 1. Install

```bash
git clone <your-fork-url>
cd sourcedraft
pnpm install
```

## 2. Project config

```bash
cp sourcedraft.config.example.json sourcedraft.config.json
```

Adjust paths and categories to match your site. The defaults suit a typical Astro content collection layout.

## 3. Environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
SOURCEDRAFT_ADMIN_PASSWORD=your-local-studio-password
GITHUB_TOKEN=ghp_...
GITHUB_OWNER=your-username-or-org
GITHUB_REPO=your-site-repo
GITHUB_BRANCH=main
```

### GitHub token

Create a fine-grained or classic personal access token with permission to read and write contents in the target repository. SourceDraft uses it only on the server when you click **Publish to GitHub**.

If owner, repo, or token is missing, publishing will fail with a clear error.

## 4. Run Studio

```bash
pnpm dev
```

This starts:

- the Studio UI (Vite)
- the publish API (Express on port `8787` by default)

Sign in with `SOURCEDRAFT_ADMIN_PASSWORD`.

## 5. Write and publish

1. Open **New Article**
2. Enter title, description, dates, category, tags, and body
3. Check the MDX preview and output path
4. Click **Publish to GitHub**

SourceDraft validates the article, converts it to MDX, and commits the file to your configured branch.

## 6. Verify on GitHub

Open your repository on GitHub and confirm the new `.mdx` file appears under `contentDir`. Your static site build step (CI, local build, or host deploy) picks it up from there.

## Troubleshooting

| Problem | Likely cause |
|---------|----------------|
| Cannot sign in | `SOURCEDRAFT_ADMIN_PASSWORD` missing in `.env` |
| Publish API unreachable | API server not running; use `pnpm dev` not `pnpm dev:web` alone |
| GitHub 401/403 | Invalid or under-scoped `GITHUB_TOKEN` |
| Wrong file path | Check `contentDir` in `sourcedraft.config.json` or `CMS_CONTENT_DIR` |

For a plain-language overview, see [non-technical-overview.md](non-technical-overview.md).
