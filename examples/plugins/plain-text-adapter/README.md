# Plain text adapter plugin

Example server-side plugin that registers a `plain-text` adapter. Output files use `.txt` extension with a simple title + body layout.

## Enable

In `sourcedraft.config.json` at the repo root:

```json
{
  "adapter": "plain-text",
  "contentDir": "content/posts",
  "plugins": ["./examples/plugins/plain-text-adapter/index.js"]
}
```

Restart the Studio API server after changing plugins.

## Notes

- Plugins run **only on the server** when the publish API starts.
- This plugin does not receive secrets — it only registers an adapter.
- See [docs/plugins.md](../../docs/plugins.md) for the full plugin contract.
