import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractPluginModule, validatePluginManifest } from "./manifest.js";

describe("plugin manifest", () => {
  it("validates a complete manifest", () => {
    const result = validatePluginManifest({
      name: "demo",
      version: "1.0.0",
      requiresSourceDraft: "0.0.1",
      description: "Demo plugin",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.manifest.name, "demo");
      assert.equal(result.manifest.description, "Demo plugin");
    }
  });

  it("rejects invalid manifest", () => {
    const result = validatePluginManifest({ name: "demo" });
    assert.equal(result.ok, false);
  });

  it("extracts setup from module exports", () => {
    const result = extractPluginModule({
      name: "demo",
      version: "1.0.0",
      requiresSourceDraft: "0.0.1",
      setup() {},
    });

    assert.equal(result.ok, true);
  });

  it("extracts manifest and setup from separate exports", () => {
    const result = extractPluginModule({
      manifest: {
        name: "demo",
        version: "1.0.0",
        requiresSourceDraft: "0.0.1",
      },
      setup() {},
    });

    assert.equal(result.ok, true);
  });

  it("rejects module without setup", () => {
    const result = extractPluginModule({
      name: "demo",
      version: "1.0.0",
      requiresSourceDraft: "0.0.1",
    });

    assert.equal(result.ok, false);
  });
});
