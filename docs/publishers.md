# Publishers

SourceDraft publishers are **connectors** — they send validated article data to a target. SourceDraft is not a hosted CMS. The Studio editor runs locally; publishing always happens through the server-side publish API.

## Publisher kinds

| Kind | Publishers | What they do |
|------|------------|--------------|
| **Git file** | `github`, `gitlab`, `bitbucket` | Commit rendered `.md` / `.mdx` files (and media) to a repository |
| **Remote CMS API** | `wordpress`, `ghost` | Create or update posts through HTTP APIs |

Set the active publisher in `sourcedraft.config.json` (`publisher`) or override with `CMS_PUBLISHER` in `.env`.

## Compatibility matrix

| Publisher | Kind | Publish post | Upload media | List/read in Studio | Update existing | Official API docs |
|-----------|------|--------------|--------------|---------------------|-----------------|-------------------|
| `github` | Git | Yes | Yes (`github-media`) | Yes | Yes (`sourcePath`) | [GitHub Contents API](https://docs.github.com/en/rest/repos/contents) |
| `gitlab` | Git | Yes | Yes (`github-media`) | Yes | Yes (`sourcePath`) | [GitLab Repository Files](https://docs.gitlab.com/ee/api/repository_files.html) |
| `bitbucket` | Git | Yes | Yes (`github-media`) | No | Yes (`sourcePath`) | [Bitbucket Source API](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-source/) |
| `wordpress` | Remote CMS | Yes | No (use Cloudinary or git media with a git publisher) | No | Yes (`remoteId`) | [WP REST Posts](https://developer.wordpress.org/rest-api/reference/posts/) |
| `ghost` | Remote CMS | Yes | No | No | Yes (`remoteId`) | [Ghost Admin API](https://docs.ghost.org/admin-api/) |

Connector doc screenshots (optional, maintainer-captured): [assets/screenshots/connectors/README.md](assets/screenshots/connectors/README.md)

Quickstart copy-paste configs: [quickstart-recipes.md](quickstart-recipes.md)

## Git file publishers

- Render output comes from the selected [adapter](adapters.md) (frontmatter + body).
- `sourcePath` in publish requests selects an existing repo file to update.
- Media uploads use `mediaDir` when supported.

Details: [git-publishers.md](git-publishers.md) · [github-publishing.md](github-publishing.md)

## Remote CMS publishers

- Publish uses structured article fields (`title`, `slug`, `body`, tags, SEO fields, etc.).
- The adapter preview still shows the file that *would* be written for a Git workflow; the CMS publisher sends `body` and metadata to the remote API.
- **Markdown:** SourceDraft does not ship a Markdown-to-HTML converter. WordPress receives the body as-is (rendering depends on your theme/plugins). Ghost uses `?source=html` — write HTML in the body or accept plain-text storage.
- **Updates:** Pass `remoteId` in the publish API body (WordPress post id or Ghost uuid). Without `remoteId`, each publish creates a new remote post.
- **Listing/editing:** Remote CMS publishers do not list existing posts in Studio today. Use Git publishers if you need the Posts sidebar against a remote repo.

Details: [wordpress.md](wordpress.md) · [ghost.md](ghost.md)

## Security

**All publisher credentials stay in `.env` on the server.** They are never sent to the browser, never committed to git, and never belong in `sourcedraft.config.json`.

Remote CMS publishers (`wordpress`, `ghost`) must only run in a trusted server environment — same as Git tokens. Do not expose Studio publicly without HTTPS and hardened auth.

## Registry

Built-in publishers register through `@sourcedraft/publishers` (`publisherRegistry`). Unknown publisher ids fail at config load with a clear error before any API call.

| Publisher | Package | Kind |
|-----------|---------|------|
| `github` | `@sourcedraft/github-publisher` | git |
| `gitlab` | `@sourcedraft/publishers` | git |
| `bitbucket` | `@sourcedraft/publishers` | git |
| `wordpress` | `@sourcedraft/publishers` | remote-cms |
| `ghost` | `@sourcedraft/publishers` | remote-cms |

See also: [configuration.md](configuration.md)
