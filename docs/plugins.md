# Plugins

SourceDraft supports **server-side plugins** that register custom adapters, publishers, and media providers. There is no plugin marketplace, no frontend plugin loading, and no automatic npm installs.

## Security warning

Plugins are **executable JavaScript** loaded by the publish API on startup. Only load plugins you trust. Plugins cannot read `.env` or secrets unless you pass values explicitly through `publisherOptions` / provider config at runtime. Do not load remote URLs as plugins.

## Plugin contract

Each plugin module exports a manifest and `setup` function:

```javascript
export const manifest = {
  name: "my-plugin",
  version: "1.0.0",
  requiresSourceDraft: "0.0.1",
  description: "Optional human-readable summary",
};

export function setup(context) {
  context.registerAdapter({ /* ... */ });
  // context.registerPublisher({ /* ... */ });
  // context.registerMediaProvider({ /* ... */ });
}
```

### Manifest fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | yes | Stable plugin id (used in `requiredPlugins`) |
| `version` | yes | Plugin semver string |
| `requiresSourceDraft` | yes | Minimum SourceDraft version (`0.0.1` today) |
| `description` | no | Short explanation for logs/docs |

### Setup context

`setup(context)` receives only:

| API | Purpose |
|-----|---------|
| `registerAdapter(adapter)` | Add a custom output adapter |
| `registerPublisher(factory)` | Add a publish target |
| `registerMediaProvider(factory)` | Add a media upload backend |
| `logger.info/warn/error` | Prefixed server logs |

Plugins do **not** receive Express, Studio UI hooks, or full app internals.

## Configuration

In `sourcedraft.config.json`:

```json
{
  "plugins": ["./plugins/my-adapter.js"],
  "requiredPlugins": ["my-adapter-plugin"],
  "discoverPlugins": false
}
```

| Field | Description |
|-------|-------------|
| `plugins` | Explicit entry paths, relative to the config file directory |
| `requiredPlugins` | Manifest `name` values that must load or startup fails |
| `discoverPlugins` | When `true`, also load `plugins/*.js` next to the config (one directory level, `.js`/`.mjs`/`.cjs` only) |

Prefer explicit `plugins` paths over directory discovery.

## Lifecycle

1. **Discover** — collect explicit paths and optional `./plugins` files
2. **Validate manifest** — name, version, `requiresSourceDraft`
3. **Load** — dynamic `import()` of each file (server only)
4. **Setup** — call `setup(context)` to register adapters/publishers/providers
5. **Isolate failures** — optional plugins log a warning and continue; required plugins abort startup

## Version compatibility

`requiresSourceDraft` uses semver `major.minor.patch` comparison. A plugin requiring `0.0.1` runs on `0.0.1` and later patch releases with the same major/minor.

When SourceDraft bumps versions, update your plugin manifest if you depend on new APIs.

## Example

See [examples/plugins/plain-text-adapter](../examples/plugins/plain-text-adapter/) — registers a `plain-text` adapter that writes `.txt` files.

```json
{
  "adapter": "plain-text",
  "plugins": ["./examples/plugins/plain-text-adapter/index.js"]
}
```

Restart the Studio API after plugin changes (`pnpm dev`).

## Custom adapter plugin

Implement the same `Adapter` shape as built-in adapters:

- `id` — unique string (e.g. `my-format`)
- `previewMeta` — `{ label, extension }`
- `render(article)` — file contents
- `getPath(article, config)` — repo-relative path
- `fromFrontmatter(...)` — parse existing files for editing

Register in `setup` via `context.registerAdapter(...)`.

## Custom publisher / media provider

Publishers implement `PublisherFactory` (`id`, `kind`, `capabilities`, `createPublisher`). Media providers implement `MediaProviderFactory`. See `@sourcedraft/publishers` and `@sourcedraft/media-providers` types in the monorepo — plugins use the same interfaces through `context.registerPublisher` / `registerMediaProvider`.

Credentials belong in `.env` and `publisherOptions`; the factory receives `PublisherRuntimeConfig` when Studio creates a publisher instance.

## Related docs

- [adapters.md](adapters.md)
- [publishers.md](publishers.md)
- [media.md](media.md)
- [configuration.md](configuration.md)
