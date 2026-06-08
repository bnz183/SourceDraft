# Astro MDX integration example (folder layout)

This is not a complete Astro website. It shows the folder structure and configuration SourceDraft expects when publishing to an Astro MDX blog.

You cannot run `pnpm dev` or `pnpm build` in this folder. There is no Astro app here — only a sample content path, one example post, and config files for reference.

## What you are looking at

| Item | Purpose |
|------|---------|
| `src/content/blog/` | Where published `.mdx` files should live in your real blog repo |
| `getting-started-with-sourcedraft.mdx` | Example of a file SourceDraft commits to GitHub |
| `sourcedraft.config.json` | Settings that match this folder layout |
| `.env.example` | Reminder of which variables belong in SourceDraft’s `.env` |

## How publishing connects

```
SourceDraft Studio  →  validate article  →  astro-mdx adapter
                                              ↓
                                    MDX file content
                                              ↓
                         GitHub commit to your blog repository
                                              ↓
                              src/content/blog/your-slug.mdx
                                              ↓
                         Your Astro site build (you run this separately)
```

SourceDraft writes files. Your Astro project — hosted in **its own repository** — builds the site as it already does.

## Expected folder layout (in your blog repo)

```
your-astro-blog/
  src/
    content/
      blog/              ← contentDir (posts land here)
        my-post.mdx
    assets/
      images/            ← mediaDir when using src/assets (public URLs via publicMediaPath)
  public/
    images/              ← alternative mediaDir (public URLs often /images/...)
```

The path `examples/astro-blog/` in the SourceDraft repo mirrors that layout so you can see it without cloning a full site.

## Example config

[`sourcedraft.config.json`](sourcedraft.config.json):

```json
{
  "adapter": "astro-mdx",
  "contentDir": "src/content/blog",
  "mediaDir": "public/images",
  "publicMediaPath": "/images",
  "defaultBranch": "main",
  "categories": ["Guides", "Notes", "Reviews", "Tutorials", "Reference"]
}
```

Copy these values into SourceDraft’s root `sourcedraft.config.json` (or match them in your own file). Set `.env` to point at **your** GitHub repository:

```env
GITHUB_OWNER=your-github-user
GITHUB_REPO=your-astro-blog
GITHUB_BRANCH=main
```

**`mediaDir`** is where Studio commits uploaded images in your repo (for example `public/images`).

**`publicMediaPath`** is the URL path Studio inserts into `heroImage` and body Markdown (for example `/images/filename.png`). Set both explicitly when your repo path and public URL do not follow the default derivation rules.

See [docs/media.md](../../docs/media.md).

A post with slug `getting-started-with-sourcedraft` is published to:

```
src/content/blog/getting-started-with-sourcedraft.mdx
```

## Example published file

[`src/content/blog/getting-started-with-sourcedraft.mdx`](src/content/blog/getting-started-with-sourcedraft.mdx) shows YAML frontmatter plus MDX body — the output of `@sourcedraft/adapter-astro-mdx`.

Your Astro content collection should accept fields such as `title`, `description`, `pubDate`, `category`, `tags`, and `draft`, with optional `updatedDate` and `heroImage`.

## What to copy into your own Astro blog

You do **not** copy this whole `examples/astro-blog` folder into SourceDraft as a runnable app. You align **your existing** Astro blog with the same ideas:

1. **Paths** — Put posts where SourceDraft can reach them (usually `src/content/blog/`). Set `contentDir` to that path.
2. **Config** — Copy `adapter`, `contentDir`, `mediaDir`, `publicMediaPath`, `defaultBranch`, and `categories` from the example config into SourceDraft’s `sourcedraft.config.json`. Adjust categories for your site.
3. **GitHub target** — In SourceDraft’s `.env`, set `GITHUB_OWNER` and `GITHUB_REPO` to your blog repository (not the SourceDraft tool repo, unless you use a monorepo).
4. **Test publish** — Create a post in Studio (**New post**), publish once, and confirm the new `.mdx` file appears on GitHub in the right folder.
5. **Build as usual** — Run your normal Astro build or CI. No change to your deploy pipeline is required.

Categories in config control the Studio dropdown. They only need to match your Astro setup if your site enforces specific values at build time.

## What this example does not include

- A complete Astro website or starter template
- `package.json`, dependencies, or a build command
- Layouts, pages, routing, or styling
- Astro content collection `config.ts` (you keep that in your real project)
- Instructions to run this folder as a local site

Image uploads are handled by SourceDraft Studio (see [docs/media.md](../../docs/media.md)), not by this example folder.

Your blog repository remains the home for site code. SourceDraft remains the writing and publish tool.

## Case study

[QuBrite.com](https://qubrite.com) was the first site published with SourceDraft using this same Astro MDX pattern. You do not need QuBrite’s repo or categories — only the same kind of folder layout and config.
