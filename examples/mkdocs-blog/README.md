# MkDocs integration example (folder layout)

This is not a runnable MkDocs site. It shows how SourceDraft publishes Markdown pages for MkDocs.

SourceDraft does **not** edit `mkdocs.yml`. After publishing, add the new file path to your nav manually (Studio preview shows a nav hint).

## Example config

[`sourcedraft.config.json`](sourcedraft.config.json):

```json
{
  "adapter": "mkdocs-markdown",
  "contentDir": "docs",
  "adapterOptions": {
    "navSection": "Blog"
  }
}
```

## Sample output

See [`docs/getting-started-with-sourcedraft.md`](docs/getting-started-with-sourcedraft.md).

Example `mkdocs.yml` nav entry (you add this yourself):

```yaml
nav:
  - Blog:
      - Getting started: docs/getting-started-with-sourcedraft.md
```
