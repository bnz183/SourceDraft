import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyDeployHookStrictMode,
  triggerDeployHook,
  type DeployHookConfig,
} from "./deployHook.js";

describe("deploy hook", () => {
  it("skips when DEPLOY_HOOK_URL is not configured", async () => {
    const result = await triggerDeployHook("src/content/blog/post.mdx", {});
    assert.equal(result.triggered, false);
    assert.equal(result.ok, true);
  });

  it("reports success when deploy hook returns 200", async () => {
    const config: DeployHookConfig = {
      url: "https://example.com/hook",
      method: "POST",
      provider: "vercel",
      fetch: async (url, init) => {
        assert.equal(url, "https://example.com/hook");
        assert.equal(init?.method, "POST");
        return new Response("ok", { status: 200 });
      },
    };

    const result = await triggerDeployHook("src/content/blog/post.mdx", config);
    assert.equal(result.triggered, true);
    assert.equal(result.ok, true);
    assert.equal(result.status, 200);
  });

  it("reports failure without failing publish in non-strict mode", async () => {
    const config: DeployHookConfig = {
      url: "https://example.com/hook",
      method: "POST",
      provider: "generic",
      strict: false,
      fetch: async () => new Response("fail", { status: 500 }),
    };

    const hook = await triggerDeployHook("src/content/blog/post.mdx", config);
    const gate = applyDeployHookStrictMode(true, hook, false);

    assert.equal(hook.ok, false);
    assert.equal(gate.ok, true);
  });

  it("fails publish in strict mode when deploy hook fails", async () => {
    const config: DeployHookConfig = {
      url: "https://example.com/hook",
      method: "POST",
      provider: "netlify",
      strict: true,
      fetch: async () => new Response("fail", { status: 502 }),
    };

    const hook = await triggerDeployHook("src/content/blog/post.mdx", config);
    const gate = applyDeployHookStrictMode(true, hook, true);

    assert.equal(hook.ok, false);
    assert.equal(gate.ok, false);
    if (!gate.ok) {
      assert.match(gate.error ?? "", /DEPLOY_HOOK_STRICT/);
    }
  });
});
