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
