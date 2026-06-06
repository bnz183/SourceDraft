# Non-technical overview

SourceDraft is a writing desk for people who publish a blog from files stored in GitHub.

## The problem it solves

If your blog is built with a static site tool (like Astro), each post is usually a file with some metadata at the top and your article text below. That works well, but day-to-day writing can get fiddly:

- keeping slugs and dates consistent
- checking that required fields are filled in
- knowing exactly what file will land in the repo
- publishing without opening five different tools

SourceDraft puts the writing step in one place.

## What you do in Studio

1. **Sign in** with a local password (set by whoever runs SourceDraft on your machine or server)
2. **Write** your post title, description, category, tags, and body
3. **Preview** the MDX file before it ships
4. **Publish** to GitHub when the form passes validation

That is the core loop. There is no separate “admin panel” full of charts or account settings.

## What SourceDraft does not do

- It does not host your website
- It does not replace your site builder
- It does not upload images for you (yet)
- It does not manage comments, newsletters, or analytics

Your existing deploy process still builds and serves the site. SourceDraft only adds or updates content files in the repository.

## What you need before publishing

Publishing requires:

- a GitHub repository for your site
- a GitHub token with write access to that repo (kept secret on the server)
- the repo owner name and repository name in configuration

Without those, you can still draft and preview in Studio, but publish will not work.

## Who runs the technical setup?

Someone comfortable with `.env` files and GitHub tokens sets up SourceDraft once. After that, a writer only needs the Studio URL and the admin password.

For setup steps, see [getting-started.md](getting-started.md).
