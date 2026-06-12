# Public launch checklist

Operator checklist for taking SourceDraft from "public repository" to
"actively promoted project". Complements [RELEASE_CHECKLIST.md](../RELEASE_CHECKLIST.md)
(per-release gates) — run both before the first announcement.

## 1. Pre-public checks

- [ ] `RELEASE_CHECKLIST.md` fully green for the current version
- [ ] README renders correctly on GitHub (images, tables, anchors)
- [ ] All README/doc links resolve (no 404s, no links to private resources)
- [ ] `docs/project-status.md` matches reality — shipped / experimental / not
      shipped all still accurate
- [ ] No production/SaaS/enterprise overclaims anywhere in docs
- [ ] License consistent: AGPL-3.0-or-later in `LICENSE`, `package.json`, README
- [ ] GitHub repo settings: description, topics (`cms`, `markdown`, `mdx`,
      `git-based-cms`, `static-site-generator`, `astro`), social preview image
- [ ] Issue templates and PR template work (open a draft issue to verify)
- [ ] `SECURITY.md` private reporting path works (Security tab → advisories enabled)

## 2. Build and test

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm exec playwright install chromium   # first time only
pnpm test:e2e
```

- [ ] All commands exit 0 locally
- [ ] CI green on `main` (build-and-test + studio-e2e jobs)
- [ ] CodeQL: no open high-severity alerts

## 3. Security sanity checks

- [ ] No-secrets scan on tracked files:
      `git grep -nIiE 'ghp_[A-Za-z0-9]|gho_[A-Za-z0-9]|glpat-|BEGIN [A-Z ]*PRIVATE KEY' -- ':!*.example*'` → no hits
- [ ] `git ls-files | grep -E '^\.env'` → only `.env.example`
- [ ] `sourcedraft.config.example.json` and `.env.example` contain placeholders only
- [ ] Screenshots in `docs/assets/` show demo content, no tokens or personal data
- [ ] `docs/security.md` limitations section still matches the code

## 4. Demo mode test (fresh-clone simulation)

In a clean clone with no `.env`:

- [ ] `pnpm install && pnpm dev` starts without errors
- [ ] Sign-in screen shows **Explore demo mode**
- [ ] Demo banner clearly states no commits are made
- [ ] Sample posts load; editing works; **Simulate publish** succeeds
- [ ] Settings → Setup health shows useful next actions, no secret values

## 5. Manual GitHub publish test

Against a **test** repository (never production):

- [ ] Direct mode: publish a new post → file appears at the expected
      `contentDir` path with correct frontmatter
- [ ] Upload an image → lands in `mediaDir`; URL in post uses `publicMediaPath`
- [ ] Edit the same post → same file updated, no duplicate
- [ ] Wrong token/repo produces a clear error, not a blank screen

## 6. PR publish test

On a test repo with branch protection on `main`:

- [ ] `SOURCEDRAFT_PUBLISH_MODE=pull-request` → publish creates a PR with the
      expected file path and branch prefix
- [ ] Optional: `draft-pull-request` mode creates a draft PR
- [ ] Merging the PR produces the correct file on `main`

## 7. Screenshot / video checklist

- [ ] `pnpm screenshots:generate` run after any UI change; diffs committed
- [ ] All nine README/doc screenshots current (see [screenshots.md](screenshots.md))
- [ ] Optional demo video recorded from [demo-script.md](demo-script.md) —
      demo mode only, 1280px+ width, no real credentials on screen
- [ ] Visual style follows [brand-assets.md](brand-assets.md)

## 8. What NOT to promote yet

Do not claim or imply any of the following in announcements:

- Production-ready, enterprise-ready, or "secure for public deployment"
- Multi-user, teams, roles, or OAuth
- Hosted/cloud offering of any kind
- S3/R2 media uploads (config validation only today)
- Post list/editing in Studio for Bitbucket, WordPress, or Ghost
- Any metric you have not measured (users, stars, performance)

Honest framing wins long-term trust and avoids day-one corrections from
commenters.

## 9. Suggested announcement wording

Adjust voice to the venue; keep claims within shipped scope.

**Short (social / link aggregator title):**

> SourceDraft — an open-source publishing Studio for Markdown/MDX and
> Git-backed sites. Local editor, server-side publish API, 8 framework
> adapters, 5 publish targets (GitHub/GitLab/Bitbucket/WordPress/Ghost).
> AGPL. Early MVP, feedback welcome.

**Longer (Show HN / Reddit / blog post intro):**

> I built SourceDraft, an open-source (AGPL) publishing Studio for
> Git-backed content workflows. You write Markdown/MDX in a local browser
> Studio (Tiptap editor, content QA, preview of the exact file and path),
> and a server-side publish API commits to your repo — direct or as a pull
> request — or publishes to WordPress/Ghost APIs. Adapters handle
> frontmatter and path conventions for Astro, Next.js, Hugo,
> Eleventy/Jekyll, Docusaurus, MkDocs, and Nuxt Content.
>
> Design goals: content stays plain files in your Git repo, credentials stay
> server-side in your `.env`, and no hosted service gets access to your
> repository. There's a demo mode that runs with zero credentials if you
> want to try it in two minutes.
>
> It's an early MVP and honest about it: single-password auth for
> local/private use, no multi-user/OAuth, some publisher capabilities are
> partial (documented in the compatibility matrices). Roadmap and
> limitations are in the repo. I'd appreciate feedback, especially from
> people running Decap/Tina/CloudCannon who can tell me what they'd miss.

- [ ] Announcement drafted and checked against section 8
- [ ] You (the maintainer) are available for ~48h after posting to answer
      issues and comments

## 10. After launch

- [ ] Watch issues/discussions daily for the first week
- [ ] Label incoming issues; point newcomers to
      [contributing-roadmap.md](contributing-roadmap.md)
- [ ] Note recurring confusion → docs fixes are the highest-leverage follow-up
