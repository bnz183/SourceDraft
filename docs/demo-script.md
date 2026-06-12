# Demo scripts

Scripts for live demos and screen recordings. All of them run entirely in
**demo mode** — no credentials, no real commits — so they are safe to record
and reproducible from fixtures.

Setup before recording: fresh `pnpm dev`, browser at ~1280px width, no real
tokens anywhere on screen. Demo mode entry: leave GitHub vars unset and click
**Explore demo mode**, or set `SOURCEDRAFT_DEMO_MODE=true`. See
[demo-mode.md](demo-mode.md). Style guidance: [brand-assets.md](brand-assets.md).

Honesty rule for every cut: if the recording shows demo mode, say so. Never
present a simulated publish as a real commit.

## 60-second demo

Goal: what SourceDraft is, in one breath. One take, no detours.

1. **(0:00)** Sign-in screen. Say: "SourceDraft is an open-source Studio for
   Markdown and MDX on Git-backed sites. This is demo mode — no credentials,
   nothing gets committed." Click **Explore demo mode**.
2. **(0:10)** Posts sidebar. Open a sample post. "Posts are plain files in
   your repo; Studio reads them back through the same adapters it writes with."
3. **(0:20)** Type in the editor; show the slash command menu briefly.
4. **(0:35)** Open the preview. "This is the exact file and repo path the
   adapter will write — frontmatter included. Eight framework adapters:
   Astro, Hugo, Next.js, Docusaurus, MkDocs, more."
5. **(0:50)** Click publish → **Publish simulated**. "Real mode commits to
   GitHub — directly or as a pull request. Tokens stay server-side in `.env`.
   It's an early MVP, AGPL, on GitHub."

## 90-second demo

The 60-second script plus trust beats. Insert after step 4:

- **(+0:00)** Content quality panel: "Non-blocking QA — SEO length, alt
  text, headings, links. Warnings, not gates; you stay in control."
- **(+0:15)** Settings → Setup health: "Studio tells you what's configured
  and what's missing — booleans only, it never shows secret values."

And extend the closing line: "What it doesn't do yet: no hosted service, no
multi-user accounts, single-password auth meant for local use. That's all
documented."

## 3-minute demo

Full walkthrough for a recorded video or a live audience.

1. **(0:00) Framing.** Sign-in screen visible. "If you run an Astro, Hugo, or
   Next.js blog, publishing means hand-writing frontmatter and committing
   files. SourceDraft is a local Studio that does that for you — content
   stays in your Git repo, credentials stay on your server. This whole demo
   is demo mode: sample posts, simulated publishing, zero credentials."
2. **(0:20) Enter demo mode.** Point out the banner — the UI itself tells
   you nothing will be committed.
3. **(0:35) Create a post.** New post → title, description, category, tags.
   Show slash commands and the Markdown toolbar; flip to source mode briefly:
   "rich editor or raw Markdown — your choice."
4. **(1:15) Content QA.** Open content quality. Leave description short or
   an image alt empty so a real warning shows. "Recommendations, not
   blockers."
5. **(1:35) Preview.** "The adapter renders the exact file: YAML frontmatter,
   body, and the path under `contentDir`. Switch adapters and the same post
   renders for Hugo or Docusaurus conventions instead."
6. **(2:00) Media.** Upload an image from fixtures; show it in the media
   library and insert it. "In real mode this commits to your `mediaDir` or
   uploads to Cloudinary; the URL uses your configured public path."
7. **(2:20) Publish.** Publish checklist → validation status, output path,
   publish mode → **Simulate publish** → simulated success. "Real mode:
   direct commit, or a pull request against a protected branch."
8. **(2:40) Secrets.** Open Settings → Setup health. "The browser never sees
   tokens. The publish API reads `.env` on the server and reports only
   booleans here."
9. **(2:50) Honest close.** "Early MVP: single-password auth for local or
   private use, no OAuth or teams, some publisher features are partial —
   the compatibility matrices in the docs say exactly what works. AGPL,
   on GitHub, feedback welcome."

## After recording

- Check every frame for personal paths, emails, or anything token-shaped
- Keep claims within [project-status.md](project-status.md)
- Update or re-record when the UI changes materially (same rule as
  screenshots — see [screenshots.md](screenshots.md))
