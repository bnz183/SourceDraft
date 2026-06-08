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

Your Next.js app must read these files from `contentDir` and render MDX as you already do. SourceDraft only writes files to your git remote.

## How to publish

1. Copy `sourcedraft.config.json` values into SourceDraft root config.
2. Set `GITHUB_*` (or GitLab/Bitbucket) in `.env` pointing at your Next.js blog repo.
3. **New post** in Studio → preview `content/posts/<slug>.mdx` → **Publish**.
4. Run `pnpm build` or your Next.js CI.

Recipe: [docs/quickstart-recipes.md](../../docs/quickstart-recipes.md#nextjs-mdx--github)
