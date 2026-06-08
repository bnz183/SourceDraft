# Hugo integration example (folder layout)

This is not a complete Hugo site. It shows the folder structure and configuration SourceDraft expects when publishing Hugo Markdown posts.

## Example config (YAML frontmatter)

[`sourcedraft.config.json`](sourcedraft.config.json):

```json
{
  "adapter": "hugo-markdown",
  "contentDir": "content/posts",
  "mediaDir": "static/images",
  "publicMediaPath": "/images",
  "defaultBranch": "main",
  "categories": ["Guides", "Notes", "Reviews", "Tutorials", "Reference"],
  "adapterOptions": {
    "frontmatterFormat": "yaml"
  }
}
```

Set `"frontmatterFormat": "toml"` for TOML frontmatter (`+++` delimiters).

A post with slug `getting-started-with-sourcedraft` is published to:

```
content/posts/getting-started-with-sourcedraft.md
```

## Sample output

See [`content/posts/getting-started-with-sourcedraft.md`](content/posts/getting-started-with-sourcedraft.md).

## How to publish

1. Copy config into SourceDraft’s `sourcedraft.config.json` (`adapter`: `hugo-markdown`).
2. Set `mediaDir` / `publicMediaPath` to match your Hugo `static/` layout.
3. Configure git publisher in `.env` (GitHub, GitLab, or Bitbucket).
4. Publish from Studio → `content/posts/<slug>.md` in your Hugo repo.
5. Run `hugo` or your CI deploy.

GitLab recipe: [docs/quickstart-recipes.md](../../docs/quickstart-recipes.md#hugo--gitlab)
