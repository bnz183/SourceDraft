# How SourceDraft compares

An honest comparison with tools you might be evaluating. All of these are
good projects with real strengths; SourceDraft is younger and smaller than
every tool on this page. The goal here is fit, not a winner.

**Where SourceDraft sits:** a local/private Studio (editor + server-side
publish API) that writes plain `.md`/`.mdx` files to your own Git repository
through framework adapters, or publishes to WordPress/Ghost APIs. Content
stays portable; credentials stay on your server; nothing is hosted for you.

Status caveat: SourceDraft is an early MVP — see
[project-status.md](project-status.md). If you need a mature, battle-tested
product today, several tools below are further along.

## Quick orientation

| Tool | Hosting model | Where content lives | Editing model |
|------|---------------|--------------------|---------------|
| **SourceDraft** | Self-run, local/private | `.md`/`.mdx` in your Git repo (or WP/Ghost via API) | Tiptap rich editor + source mode, adapter preview |
| **Decap CMS** | Embedded in your static site (`/admin`) | Files in your Git repo | Widget-based forms + Markdown editor |
| **TinaCMS** | Self-hosted or Tina Cloud backend | Files in your Git repo | Visual/inline editing on your site |
| **CloudCannon** | Commercial hosted platform | Files in your Git repo | Visual editing, hosted UI |
| **GitCMS** | Hosted editor UI | Files in your Git repo | Hosted Markdown editing |
| **WordPress admin** | Self-hosted or wordpress.com | WordPress database | Block editor (Gutenberg) |
| **Ghost admin** | Self-hosted or Ghost(Pro) | Ghost database | Koenig editor |

## Decap CMS (formerly Netlify CMS)

**Decap is stronger on:** maturity and community, running with zero extra
process (it ships as static files in your site's `/admin`), a large widget
ecosystem, editorial workflow (draft/review states backed by PRs), and Git
gateway auth options.

**SourceDraft differs:** the Studio runs as its own local app with a
server-side publish API, so tokens never go through a browser-side Git
gateway and no `admin/config.yml` lives in your site repo. One universal
article schema renders through adapters for eight frameworks, with a preview
of the exact file path and frontmatter before each commit. If you want an
editor embedded in the deployed site itself, Decap is the better shape.

## TinaCMS

**Tina is stronger on:** visual/inline editing on your actual site, a typed
content schema with GraphQL queries, strong Next.js integration, and a
polished hosted backend (Tina Cloud) when you want auth and collaboration
without building it.

**SourceDraft differs:** it is file-first rather than site-first — there is
no integration into your site's rendering at all, which means it works the
same for Astro, Hugo, MkDocs, or Nuxt Content without framework bindings. No
cloud account is involved; everything runs from your `.env`. If live visual
editing on the rendered page matters to you, Tina is the better fit.

## CloudCannon

**CloudCannon is stronger on:** being a complete commercial product — hosted
visual editor, team accounts and permissions, client-friendly editing,
support, and site hosting/builds. For agencies handing a site to
non-technical clients, it is a much more finished answer.

**SourceDraft differs:** it is free, AGPL, and entirely under your control —
no vendor account, no hosted service touching your repository, credentials
only on your own machine or server. You trade CloudCannon's polish and team
features for ownership and zero platform dependency.

## GitCMS

**GitCMS is stronger on:** instant onboarding — connect a repo from the
browser and start editing without installing or running anything yourself.

**SourceDraft differs:** it never asks you to grant a third-party service
access to your repository. The publish API runs where you run it, tokens stay
in your `.env`, and the adapter/publisher layer targets multiple frameworks
and remote CMS APIs rather than a single hosted editing surface.

## WordPress admin

**WordPress is stronger on:** almost everything a full CMS does — themes,
plugins, media management, scheduling, multi-user roles, and twenty years of
ecosystem. If your site *is* WordPress, its admin is the native tool.

**SourceDraft differs:** it is not a CMS replacement; it is a Git-first
writing tool. Content is Markdown/MDX in your repo, not rows in a database,
so it diffs, reviews, and migrates like code. SourceDraft can also *publish
to* WordPress through its REST API — useful if you want one Markdown-first
editor in front of both a static site and a WordPress site (with documented
limits: no post list in Studio, body sent as-is without HTML conversion).

## Ghost admin

**Ghost is stronger on:** being a complete publishing platform — excellent
editor, memberships, newsletters, SEO handling, and hosting via Ghost(Pro).
For a standalone publication, Ghost is a far more complete product.

**SourceDraft differs:** same trade as WordPress — Git-owned files first,
with an optional Ghost publisher (Admin API; same documented limits) when
part of your content lives in Ghost.

## When SourceDraft is probably the wrong choice

- You need hosted multi-user accounts, roles, or client access today
- You want visual editing on the rendered page
- Your writers are non-technical and no developer runs the Studio for them
- You need a mature product with a large plugin/community ecosystem
- You need to expose the editor on the public internet (MVP auth is
  local/private only — see [security.md](security.md))

## When SourceDraft fits

- You own a Git-backed Astro/Next.js/Hugo/Eleventy/Docusaurus/MkDocs/Nuxt
  site and want one editor that writes correct frontmatter and file paths
- You want content portable as plain files, with commits (or PRs) you review
- You want publish credentials on a server you control, never in a browser
  or third-party platform
- You want one schema to target several frameworks — or both files and a
  remote CMS — through adapters and publishers

See also: [project-status.md](project-status.md) ·
[publishers.md](publishers.md) · [adapters.md](adapters.md) ·
[roadmap.md](roadmap.md)
