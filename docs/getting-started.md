# Getting started

You need a target for published content — usually a Git repository for your **site** (for example an Astro blog reading `src/content/blog`), or a WordPress/Ghost site for API publishing.

**Fast path:** copy a recipe from [quickstart-recipes.md](quickstart-recipes.md) (Astro+GitHub, Hugo+GitLab, WordPress, Cloudinary, deploy hooks, …).

## 1. Install SourceDraft

```bash
git clone https://github.com/bnz183/SourceDraft.git
cd SourceDraft
pnpm install
```

## 2. Configure SourceDraft

**Recommended — setup wizard**

```bash
pnpm setup
```

The wizard asks which adapter, publisher, and media provider you use, then creates `sourcedraft.config.json` and `.env` with plain-language prompts. Existing `.env` values are kept unless you choose to overwrite them. See [setup-wizard.md](setup-wizard.md).

**Manual — copy example files**

```bash
cp sourcedraft.config.example.json sourcedraft.config.json
cp .env.example .env
```

Edit paths, adapter, and categories to match your site. These values are safe to commit.

Pick an adapter for your stack (`astro-mdx`, `nextjs-mdx`, `hugo-markdown`, …). See the [adapters compatibility matrix](adapters.md#compatibility-matrix).

Set `publisher` to `github`, `gitlab`, `bitbucket`, `wordpress`, or `ghost`. See [publishers.md](publishers.md).

Validate anytime:

```bash
pnpm validate:config
```

## 3. Secrets (`.env`)

If you used `pnpm setup`, skip copying `.env` — the wizard already wrote it. Otherwise:

```env
SOURCEDRAFT_ADMIN_PASSWORD=your-local-studio-password
# Optional: force demo mode (no GitHub commits)
# SOURCEDRAFT_DEMO_MODE=true
GITHUB_TOKEN=ghp_...
GITHUB_OWNER=your-username-or-org
GITHUB_REPO=your-site-repo
GITHUB_BRANCH=main
```

| File | Holds |
|------|--------|
| `sourcedraft.config.json` | `contentDir`, `mediaDir`, `publicMediaPath`, categories, `adapter`, `publisher` |
| `.env` | Password, publisher credentials, optional `CMS_MEDIA_PROVIDER`, deploy hook |

See [configuration.md](configuration.md) for the full split.

### GitHub token

Create a token with permission to read and write **contents** in the target repository. SourceDraft uses it on the server when you publish posts, list/edit files, or upload images — not in the browser.

## 4. Run Studio

```bash
pnpm dev
```

Starts the editor and publish API (default API port `8787`). Use this command, not `dev:web` alone, or publish and uploads will fail.

Sign in with `SOURCEDRAFT_ADMIN_PASSWORD`.

**MVP password auth is intended for local/private use.** Do not expose Studio on the public internet without extra hardening.

## Demo mode (no GitHub required)

Use demo mode to explore Studio before connecting a repository:

1. **Environment flag:** set `SOURCEDRAFT_DEMO_MODE=true` in `.env` and restart the API, or
2. **Opt-in:** leave `GITHUB_TOKEN`, `GITHUB_OWNER`, and `GITHUB_REPO` unset and click **Try demo mode** on the sign-in screen.

Demo mode lets you explore SourceDraft without connecting a real blog. It provides sample articles from repository fixtures, local editing, simulated media upload paths, and simulated publish success. No real posts are published; sample content resets when the API restarts. See [demo-mode.md](demo-mode.md).

Demo mode never sends your GitHub token to the browser and never commits to GitHub, even if credentials are present while `SOURCEDRAFT_DEMO_MODE=true`.

## Publishing readiness

Open **Settings** in Studio. The **Publishing readiness** section explains in plain language whether SourceDraft can send articles to your blog — Studio password, blog connection, article folder, blog type, and demo mode status. Credentials are checked on the server and never shown in the browser. It suggests a next action when setup is incomplete. Advanced technical details are under **Show advanced details**.

The publish API also exposes `GET /api/health/setup` (authenticated) with the same safe diagnostics.

## 5. Write and publish

1. **Articles** sidebar — open an existing article, or click **New article**
2. Fill title and description in the center canvas; set slug, dates, and category in **Post details**; upload a cover image if needed ([media.md](media.md))
3. Check the preview to see the generated article file before sending
4. **Send to your blog** — or simulate sending in demo mode

SourceDraft validates, renders with your adapter, and sends to the configured publisher (git commit or remote CMS API).

Git publishers: [git-publishers.md](git-publishers.md) · GitHub: [github-publishing.md](github-publishing.md) · WordPress: [wordpress.md](wordpress.md) · Ghost: [ghost.md](ghost.md)

## Smoke tests (Playwright)

Browser smoke tests run against demo mode — no live GitHub credentials required:

```bash
pnpm exec playwright install chromium   # first time only
pnpm test:e2e
```

From `apps/studio`, use the same commands. CI runs `pnpm test:e2e` after build and unit tests on every push/PR to `main`.

These tests cover sign-in/demo entry, post list, editor, toolbar, autosave status, media library, content quality, setup health, and simulated publish.

Regenerate README screenshots (writes to `docs/assets/`):

```bash
pnpm screenshots:generate
```

Unit tests (default):

```bash
pnpm test
```

## 6. Verify

Open your site repo on GitHub and confirm the new file (and any uploaded images in `mediaDir`). Run your usual site build or wait for CI.

## Astro layout example

[examples/astro-blog](../examples/astro-blog/) shows expected folders and a sample MDX file. It is an integration reference, not a complete Astro app.

## Troubleshooting

| Problem | Likely cause |
|---------|----------------|
| Cannot sign in | `SOURCEDRAFT_ADMIN_PASSWORD` missing; restart API after editing `.env` |
| Publish API unreachable | Run `pnpm dev`, not UI-only |
| GitHub 401 / 403 | Token scope or wrong owner/repo |
| Wrong file path | `contentDir` in config |
| Upload rejected | File type or 5 MB limit; see [media.md](media.md) |
| Empty post list | Wrong repo in `.env` or no `.md`/`.mdx` in `contentDir` |
| Demo only | GitHub not configured or `SOURCEDRAFT_DEMO_MODE=true` — expected; configure GitHub for real publish |

Plain-language intro: [non-technical-overview.md](non-technical-overview.md)
