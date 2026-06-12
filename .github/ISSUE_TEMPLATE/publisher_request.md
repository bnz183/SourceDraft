---
name: Publisher request
about: Request or propose a new publish target (Git host or CMS API)
title: "publisher: "
labels: enhancement, publisher
assignees: ""
---

## Target

<!-- e.g. Gitea, Forgejo, Strapi — link the official API docs -->

## Kind

<!-- Git file commit, or remote CMS API? -->

## Auth model

<!-- Token type/scopes, app passwords, API keys. Secrets must stay
     server-side in .env — note any auth flow that can't work that way (e.g.
     OAuth-only APIs are currently out of scope). -->

## Capabilities expected

- Publish new post: yes / no
- Update existing post: yes / no (how is the post identified?)
- Upload media: yes / no
- List/read posts: yes / no

## Why not a plugin?

<!-- Custom publishers can load via server-side plugins (docs/plugins.md).
     Why should this one be built in? -->

## Are you willing to implement it?

<!-- See the publisher interface in docs/compatibility-roadmap.md -->
