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
