# Docusaurus blog integration example (folder layout)

This is not a runnable Docusaurus site. It shows how SourceDraft publishes MDX blog posts for Docusaurus.

## Example config

[`sourcedraft.config.json`](sourcedraft.config.json):

```json
{
  "adapter": "docusaurus-mdx",
  "contentDir": "blog",
  "adapterOptions": {
    "filenameConvention": "date-slug",
    "hideTableOfContents": false
  }
}
```

A post with slug `getting-started-with-sourcedraft` is published to:

```
blog/2024-06-01-getting-started-with-sourcedraft.mdx
```

(with `filenameConvention: "date-slug"`)

## Sample output

See [`blog/2024-06-01-getting-started-with-sourcedraft.mdx`](blog/2024-06-01-getting-started-with-sourcedraft.mdx).

Wire your Docusaurus `blog` plugin to the same folder. SourceDraft only writes files — it does not run Docusaurus.

## How to publish

1. Copy `adapter`, `contentDir`, and `adapterOptions` into SourceDraft’s `sourcedraft.config.json`.
2. Set `.env` for your git publisher (`GITHUB_*`, `GITLAB_*`, or `BITBUCKET_*`).
3. In Studio: **New post** → fill fields → confirm preview path under `blog/` → **Publish**.
4. Add the new file to Docusaurus if your setup requires manual registration (plugin usually picks up `blog/*.mdx` automatically).
5. Run your normal Docusaurus build or CI.

Recipe: [docs/quickstart-recipes.md](../../docs/quickstart-recipes.md)
