# Nuxt Content integration example (folder layout)

This is not a runnable Nuxt app. It shows how SourceDraft publishes Markdown for Nuxt Content collections.

## Example config

[`sourcedraft.config.json`](sourcedraft.config.json):

```json
{
  "adapter": "nuxt-content-markdown",
  "contentDir": "content/blog",
  "adapterOptions": {
    "navigation": true
  }
}
```

A post with slug `getting-started-with-sourcedraft` is published to:

```
content/blog/getting-started-with-sourcedraft.md
```

## Sample output

See [`content/blog/getting-started-with-sourcedraft.md`](content/blog/getting-started-with-sourcedraft.md).

Match `contentDir` to your Nuxt Content source path. SourceDraft only writes files.

## How to publish

1. Align `contentDir` with your Nuxt Content collection path (`content/blog` in this example).
2. Copy `sourcedraft.config.json` fields into SourceDraft root config; set `.env` for GitHub/GitLab/Bitbucket.
3. Publish from Studio → file appears at `content/blog/<slug>.md`.
4. Run your Nuxt build; Content picks up new files from the configured directory.

Recipe: [docs/quickstart-recipes.md](../../docs/quickstart-recipes.md)
