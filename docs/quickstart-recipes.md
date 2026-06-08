# Quickstart recipes

Copy-paste starting points for common SourceDraft setups. Each recipe assumes you cloned SourceDraft, ran `pnpm install`, and configured `.env` (or used `pnpm setup`).

See also: [getting-started.md](getting-started.md) · [configuration.md](configuration.md) · [examples/](../examples/)

---

## Astro + GitHub

**Best for:** Astro content collections with MDX posts.

```json
{
  "adapter": "astro-mdx",
  "publisher": "github",
  "contentDir": "src/content/blog",
  "mediaDir": "public/images",
  "publicMediaPath": "/images",
  "defaultBranch": "main",
  "categories": ["Guides", "Tutorials"]
}
```

```env
CMS_PUBLISHER=github
GITHUB_TOKEN=...
GITHUB_OWNER=your-org
GITHUB_REPO=your-astro-blog
CMS_MEDIA_PROVIDER=github-media
```

**Output path:** `src/content/blog/<slug>.mdx`

**Example:** [examples/astro-blog](../examples/astro-blog/)

---

## Next.js MDX + GitHub

**Best for:** Next.js blogs using MDX files in `content/posts`.

```json
{
  "adapter": "nextjs-mdx",
  "publisher": "github",
  "contentDir": "content/posts",
  "mediaDir": "public/images",
  "publicMediaPath": "/images",
  "defaultBranch": "main",
  "categories": ["Guides", "Tutorials"]
}
```

**Output path:** `content/posts/<slug>.mdx` (or `date-slug` / `index` via `adapterOptions`)

**Example:** [examples/nextjs-mdx-blog](../examples/nextjs-mdx-blog/)

---

## Hugo + GitLab

**Best for:** Hugo sites with GitLab as the git remote.

```json
{
  "adapter": "hugo-markdown",
  "publisher": "gitlab",
  "contentDir": "content/posts",
  "mediaDir": "static/images",
  "publicMediaPath": "/images",
  "defaultBranch": "main",
  "adapterOptions": { "frontmatterFormat": "yaml" }
}
```

```env
CMS_PUBLISHER=gitlab
GITLAB_TOKEN=...
GITLAB_PROJECT_PATH=group/your-hugo-site
GITLAB_BRANCH=main
```

**Output path:** `content/posts/<slug>.md`

**Example:** [examples/hugo-blog](../examples/hugo-blog/)

---

## Eleventy + Bitbucket

**Best for:** Eleventy or Jekyll-style folders on Bitbucket Cloud.

```json
{
  "adapter": "eleventy-jekyll-markdown",
  "publisher": "bitbucket",
  "contentDir": "src/posts",
  "mediaDir": "src/assets/images",
  "publicMediaPath": "/images",
  "defaultBranch": "main",
  "adapterOptions": {
    "layout": "post",
    "permalinkPrefix": "/blog/"
  }
}
```

```env
CMS_PUBLISHER=bitbucket
BITBUCKET_TOKEN=...
BITBUCKET_WORKSPACE=your-workspace
BITBUCKET_REPO_SLUG=your-site
BITBUCKET_USERNAME=your-username
```

**Output path:** `src/posts/<slug>.md`

**Note:** Bitbucket does not support listing posts in Studio yet — publish works; use GitHub/GitLab for the Posts sidebar.

**Example:** [examples/eleventy-jekyll-blog](../examples/eleventy-jekyll-blog/)

---

## WordPress publisher

**Best for:** Publishing to an existing WordPress site via REST API (no git commits).

```json
{
  "adapter": "markdown",
  "publisher": "wordpress",
  "contentDir": "content/posts",
  "categories": ["News", "Guides"]
}
```

```env
CMS_PUBLISHER=wordpress
WORDPRESS_API_URL=https://example.com/wp-json
WORDPRESS_USERNAME=editor
WORDPRESS_APP_PASSWORD=...
WORDPRESS_DEFAULT_STATUS=draft
```

**Remote:** Creates/updates posts via `/wp/v2/posts`. Pass `remoteId` on update. SEO plugin meta requires explicit `publisherOptions.wordpressSeoMeta` mapping.

Details: [wordpress.md](wordpress.md)

---

## Ghost publisher

**Best for:** Ghost(Pro) or self-hosted Ghost Admin API.

```json
{
  "adapter": "markdown",
  "publisher": "ghost",
  "contentDir": "content/posts",
  "categories": ["Guides"]
}
```

```env
CMS_PUBLISHER=ghost
GHOST_ADMIN_URL=https://your-site.com
GHOST_ADMIN_API_KEY=id:secret
GHOST_DEFAULT_STATUS=draft
```

**Remote:** HTML body via `?source=html`. Updates need `remoteId` from a prior publish.

Details: [ghost.md](ghost.md)

---

## Cloudinary media

**Best for:** CDN-hosted images while still using a git publisher for posts.

```json
{
  "adapter": "astro-mdx",
  "publisher": "github",
  "contentDir": "src/content/blog",
  "mediaDir": "public/images",
  "publicMediaPath": "/images"
}
```

```env
CMS_MEDIA_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=blog
```

Uploads return `https://res.cloudinary.com/...` URLs in article Markdown. Media library listing remains git-backed.

Details: [media.md](media.md)

---

## R2 / S3-compatible media (experimental)

**Status:** Config validation only — upload not implemented yet. Use `github-media` or `cloudinary` for production.

```env
CMS_MEDIA_PROVIDER=s3-compatible
S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com
S3_BUCKET=your-bucket
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_BASE_URL=https://cdn.example.com
S3_FORCE_PATH_STYLE=true
```

Details: [media.md](media.md) · connector docs: [assets/screenshots/connectors/README.md](assets/screenshots/connectors/README.md)

---

## Deploy hook after publish

Trigger a static site rebuild when a git publish succeeds:

```env
DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/...
DEPLOY_HOOK_PROVIDER=vercel
DEPLOY_HOOK_METHOD=POST
DEPLOY_HOOK_STRICT=false
```

| Provider | `DEPLOY_HOOK_PROVIDER` |
|----------|------------------------|
| Vercel | `vercel` |
| Netlify | `netlify` |
| Cloudflare Pages | `cloudflare-pages` |
| Other CI | `generic` |

Details: [deploy-hooks.md](deploy-hooks.md)

---

## Validate before first publish

```bash
pnpm validate:config
pnpm validate:config --connections
```

Open Studio → **Settings** → **Compatibility & status** for a read-only summary (no secrets).
