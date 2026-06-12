# Roadmap

Where SourceDraft is heading, in honest tiers. Nothing here is a commitment
with a date; items move based on real usage and contributor interest.
Technical extension details live in
[compatibility-roadmap.md](compatibility-roadmap.md).

The free, open-source AGPL version is the product. It will not be
artificially crippled to sell something later.

## Near-term (open-source, current focus)

Improvements to the existing local/private workflow:

- **Post list/read for more publishers** — Bitbucket, WordPress, and Ghost
  can publish but cannot list posts in Studio yet
- **S3/R2 media upload** — `s3-compatible` currently validates config only
- **Git Trees API indexer** — lift the Contents API limits (~1000
  entries/folder, ~1 MB inline files) for large repos
- **Media management** — delete/rename in the media library (upload + list today)
- **Better error surfaces** — keep improving actionable publisher/API errors
- **Docs and onboarding** — quickstart recipes, troubleshooting, more
  framework examples
- **More adapters via community** — see
  [contributing-roadmap.md](contributing-roadmap.md)

## Later (self-hosted hardening)

For people running Studio beyond a single laptop — still open source:

- Durable sessions (survive API restarts)
- CSRF tokens and stricter request protection suitable for reverse-proxy
  deployments
- Markdown→HTML conversion option for WordPress/Ghost bodies
- Scheduled/draft publishing workflows on top of PR modes
- Optional multi-password or per-writer identification (not full RBAC)

## Future commercial possibilities (not built, not promised)

If SourceDraft earns real adoption, a paid layer could fund maintenance.
Candidates, listed for transparency:

- Hosted **SourceDraft Cloud** (managed Studio + publish API)
- Managed setup/onboarding and migration services
- OAuth, team accounts, RBAC, persistent sessions as managed features
- Managed media storage
- Agency/client workspaces
- Premium/commercial support; possible dual-license arrangements

None of this exists, none of it is scheduled, and none of it will remove
functionality from the open-source version.

## Explicitly not now

Deliberately out of scope in the current phase:

- Paywalls, billing, SaaS plans, license gates
- Telemetry or usage analytics
- OAuth / user accounts / RBAC implementations
- Hosted or multi-tenant Studio
- Plugin marketplace
- AI writing tools
- Agent API, BYOK AI providers, MCP support, and automation endpoints
- Site hosting or running your static-site build
- Large UI redesigns

## Future: agent-ready publishing workflows

SourceDraft's structured article schema, validation, preview, and publish checklist make it a natural base for AI-assisted workflows where external agents prepare drafts and humans review before publishing.

Agent API, BYOK AI providers, MCP support, and automation endpoints are **future work**, not current shipped features.

## Influence the roadmap

Open an issue with the `feature_request`, `adapter_request`, or
`publisher_request` template. Real workflows beat hypotheticals — describe
what you publish, where, and what breaks today.
