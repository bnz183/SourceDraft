# SourceDraft

SourceDraft is a free, open-source editor for Markdown and MDX blogs backed by GitHub. You write in the browser, check your metadata, preview the MDX file, and publish into your site repository.

SourceDraft began as an internal tool for [QuBrite.com](https://qubrite.com) and is published here for anyone running a similar static-site workflow. QuBrite is the origin story, not a dependency — you point SourceDraft at your own repository and config.

## What is SourceDraft?

SourceDraft is not WordPress and not a hosted website builder. It is a local **Studio** (editor) plus a small **publish API** that commits content files to GitHub.

Your static site — Astro today, others later — still builds and deploys exactly as before. SourceDraft only creates or updates `.mdx` files in the folder you configure.

## Who is this for?

**Bloggers and writers** on Git-backed static sites who want one place to draft posts without hand-editing frontmatter and Git commands.

**Developers** who want a shared article schema, an Astro MDX adapter, and room to add more publishing targets later.

**Not a fit yet** if you need hosted multi-user accounts, in-app image uploads, or a built-in site generator in this repository.

## What it does today

- Edit articles in Studio (title, slug, dates, category, tags, body, draft flag)
- Validate fields against a universal article schema
- Preview Astro MDX output and target file path before publishing
- Publish to GitHub (create or update a file on a branch)
- Configure paths and categories in `sourcedraft.config.json`
- Protect Studio with a server-side admin password

## What it does not do yet

- Host your website or run your Astro build
- Upload images (hero image is a path string you type)
- List or sync existing posts from GitHub in Studio
- OAuth, user accounts, or role-based access
- Adapters beyond `astro-mdx`

See [docs/project-status.md](docs/project-status.md).

## How GitHub publishing works

1. You finish a valid article in Studio and click **Publish to GitHub**.
2. The **publish API** (server only) validates the article again.
3. The **astro-mdx adapter** builds the `.mdx` file (YAML frontmatter + body).
4. The **GitHub publisher** checks whether the file exists in your repo, then creates or updates it via the GitHub API.
5. Your existing CI or build step picks up the new file from `contentDir`.

The GitHub token never reaches the browser. It is read from `.env` on the server when you publish.

Details: [docs/github-publishing.md](docs/github-publishing.md)

## Quickstart

Requirements: Node.js 22+, pnpm 11+

```bash
git clone https://github.com/bnz183/SourceDraft.git
cd SourceDraft
pnpm install

cp sourcedraft.config.example.json sourcedraft.config.json
cp .env.example .env
```

Edit `.env`:

```env
SOURCEDRAFT_ADMIN_PASSWORD=choose-a-local-password
GITHUB_TOKEN=your-github-token
GITHUB_OWNER=your-github-username-or-org
GITHUB_REPO=your-site-repo
```

Start Studio (UI + publish API):

```bash
pnpm dev
```

Sign in, open **New Article**, preview the MDX, publish. The file lands at `contentDir/<slug>.mdx` (default: `src/content/blog/`).

Full walkthrough: [docs/getting-started.md](docs/getting-started.md)

## Beginner path

If someone technical already installed SourceDraft and pointed it at your blog repository, you only need:

1. The Studio address (usually `http://localhost:5173` on their machine)
2. The admin password they set in `.env`
3. Your site’s category list (from `sourcedraft.config.json`)

Then: sign in → **New Article** → fill in title, description, date, category, tags, and body → check the MDX preview → **Publish to GitHub**. Your post appears as a file in the blog repo; the normal site build deploys it.

You do not edit GitHub by hand or run terminal commands for each post. If publish is disabled, ask your technical contact to check `.env` (GitHub token and repo) and that Studio is running with `pnpm dev`.

Plain-language guide: [docs/non-technical-overview.md](docs/non-technical-overview.md)

## Security note

MVP password auth is intended for local/private use. Do not expose Studio publicly without HTTPS, stronger auth, and deployment hardening.

Details: [docs/security.md](docs/security.md)

## Configuration: two files, two jobs

| | `sourcedraft.config.json` | `.env` |
|---|---------------------------|--------|
| **Purpose** | Project settings safe to commit | Secrets and private targets |
| **Examples** | `contentDir`, `categories`, `adapter` | `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `SOURCEDRAFT_ADMIN_PASSWORD` |
| **Shared in git?** | Yes (copy from `sourcedraft.config.example.json`) | Never |

Optional env vars (`CMS_CONTENT_DIR`, `CMS_ADAPTER`, etc.) can override values from the JSON file. Secrets always stay in `.env`.

Reference: [docs/configuration.md](docs/configuration.md)

## Astro integration example

[examples/astro-blog/](examples/astro-blog/) is a **folder layout example** — not a runnable Astro site. It shows where files go, a sample published `.mdx`, and matching config. Read its README before copying paths into your own blog repo.

## Documentation

- [Getting started](docs/getting-started.md)
- [Non-technical overview](docs/non-technical-overview.md) — for writers
- [GitHub publishing](docs/github-publishing.md)
- [Configuration](docs/configuration.md)
- [Astro integration example](docs/astro-blog-example.md)
- [Architecture](docs/architecture.md)
- [Project status](docs/project-status.md)
- [Security](docs/security.md)

## License

[MIT](LICENSE)
