# Next.js MDX integration example (folder layout)

This is not a complete Next.js app. It shows the folder structure and configuration SourceDraft expects when publishing to a Next.js MDX blog.

## Example config

[`sourcedraft.config.json`](sourcedraft.config.json):

```json
{
  "adapter": "nextjs-mdx",
  "contentDir": "content/posts",
  "mediaDir": "public/images",
  "publicMediaPath": "/images",
  "defaultBranch": "main",
  "categories": ["Guides", "Notes", "Reviews", "Tutorials", "Reference"]
}
```

A post with slug `getting-started-with-sourcedraft` is published to:

```
content/posts/getting-started-with-sourcedraft.mdx
```

## Sample output

See [`content/posts/getting-started-with-sourcedraft.mdx`](content/posts/getting-started-with-sourcedraft.mdx) for YAML frontmatter (`date`, `coverImage`, SEO fields) plus MDX body — the output of `@sourcedraft/adapter-nextjs-mdx`.

Your Next.js app must read these files from `contentDir` and render MDX as you already do. SourceDraft only writes files to GitHub.
