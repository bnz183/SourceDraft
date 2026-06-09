# GitHub pull request publishing

Use PR publish modes when `main` (or your default branch) is **branch-protected** and direct commits are blocked.

## Modes

| Mode | Behavior |
|------|----------|
| `direct` | Commit post file to the base branch (default) |
| `pull-request` | Commit to a SourceDraft branch and open a PR into the base branch |
| `draft-pull-request` | Same as pull request, but the PR is created as a draft |

Studio shows the mode selector in the publish bar. The server default comes from config; you can override per publish in the UI.

## Configuration

Set in `.env` (server-side only):

| Variable | Purpose |
|----------|---------|
| `SOURCEDRAFT_PUBLISH_MODE` | `direct`, `pull-request`, or `draft-pull-request` |
| `SOURCEDRAFT_PR_BRANCH_PREFIX` | Prefix for generated branches (default `sourcedraft/`) |
| `SOURCEDRAFT_PR_DRAFT` | When `true` with `pull-request`, creates draft PRs |

**GitHub publisher only.** GitLab, Bitbucket, WordPress, and Ghost publishers use their native APIs — PR mode does not apply.

Deploy hooks are skipped for PR modes because the base branch is unchanged until merge.

## Protected branches

If direct publish fails with a protected-branch error, switch to `pull-request` or `draft-pull-request` and publish again. Studio surfaces the server error with this guidance.

## Smoke test (manual)

On a test repo with branch protection:

1. Set `SOURCEDRAFT_PUBLISH_MODE=pull-request` in `.env` and restart the API.
2. Publish a valid post from Studio.
3. Confirm a PR is created on GitHub with the expected file path.
4. Merge the PR and verify the file lands on the base branch.

See also: [github-publishing.md](github-publishing.md) · [RELEASE_CHECKLIST.md](../RELEASE_CHECKLIST.md)
