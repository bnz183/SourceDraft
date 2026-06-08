# Deploy hooks

SourceDraft can optionally trigger a **deploy hook** after a successful publish. This is useful when your site builds on Vercel, Netlify, Cloudflare Pages, or another CI system that exposes a webhook URL.

Deploy hooks are **optional**. If `DEPLOY_HOOK_URL` is unset, publishing works exactly as before.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DEPLOY_HOOK_URL` | Yes to enable | Webhook URL from your host (keep secret in `.env`) |
| `DEPLOY_HOOK_METHOD` | No | HTTP method; default `POST` |
| `DEPLOY_HOOK_PROVIDER` | No | `generic`, `vercel`, `netlify`, or `cloudflare-pages` (default `generic`) |
| `DEPLOY_HOOK_STRICT` | No | When `true`, publish fails if the deploy hook fails |

All values are server-side only. Never commit hook URLs to git.

## Behavior

1. Article publishes successfully through the configured publisher.
2. If `DEPLOY_HOOK_URL` is set, SourceDraft sends a `POST` (or configured method) with a small JSON body:

```json
{
  "source": "sourcedraft",
  "path": "src/content/blog/my-post.mdx"
}
```

3. The publish API response includes a `deployHook` object when a hook was called:

```json
{
  "ok": true,
  "path": "src/content/blog/my-post.mdx",
  "deployHook": {
    "triggered": true,
    "ok": true,
    "status": 200,
    "message": "Deploy hook succeeded (200)."
  }
}
```

4. Studio shows the deploy hook message in the publish success banner when present.

### Strict mode

By default, a deploy hook failure does **not** fail the publish — your content is already committed or saved remotely.

Set `DEPLOY_HOOK_STRICT=true` when you want publish to return an error if the hook fails. Use this only when you need atomic “publish + deploy” semantics.

## Compatibility matrix

| Provider | `DEPLOY_HOOK_PROVIDER` | Status | Typical hook source | Auth |
|----------|------------------------|--------|---------------------|------|
| Generic | `generic` | Shipped | Any CI webhook accepting `POST` + JSON | URL secret |
| Vercel | `vercel` | Shipped | Project → Settings → Git → Deploy Hooks | URL secret |
| Netlify | `netlify` | Shipped | Site → Build & deploy → Build hooks | URL secret |
| Cloudflare Pages | `cloudflare-pages` | Shipped | Pages project → Settings → Builds → Deploy hooks | URL secret |

SourceDraft does not store provider API tokens for deploy hooks — the hook URL itself is the credential.

Recipe: [quickstart-recipes.md#deploy-hook-after-publish](quickstart-recipes.md#deploy-hook-after-publish)

## Security

- Treat `DEPLOY_HOOK_URL` like a password. Anyone with the URL can trigger builds.
- Run Studio on a trusted server. Hooks are called from the publish API, never from the browser.

See also: [configuration.md](configuration.md) · [publishers.md](publishers.md)
