import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canSubmitPublish, isRealPublish } from "./publishGate.js";

describe("publish gating", () => {
  it("treats only a connected, non-demo Studio as a real publish", () => {
    assert.equal(isRealPublish({ githubReady: true, demoMode: false }), true);
    assert.equal(isRealPublish({ githubReady: true, demoMode: true }), false);
    assert.equal(isRealPublish({ githubReady: false, demoMode: false }), false);
  });

  it("allows demo mode to submit (simulation only), never a real publish", () => {
    const inputs = {
      ready: true,
      publishing: false,
      githubReady: false,
      demoMode: true,
    };
    assert.equal(canSubmitPublish(inputs), true);
    assert.equal(isRealPublish(inputs), false);
  });

  it("allows a configured non-demo Studio to publish for real", () => {
    assert.equal(
      canSubmitPublish({
        ready: true,
        publishing: false,
        githubReady: true,
        demoMode: false,
      }),
      true,
    );
  });

  it("blocks publish when not connected and not in demo mode", () => {
    assert.equal(
      canSubmitPublish({
        ready: true,
        publishing: false,
        githubReady: false,
        demoMode: false,
      }),
      false,
    );
  });

  it("blocks publish for invalid or in-flight articles", () => {
    assert.equal(
      canSubmitPublish({
        ready: false,
        publishing: false,
        githubReady: true,
        demoMode: false,
      }),
      false,
    );
    assert.equal(
      canSubmitPublish({
        ready: true,
        publishing: true,
        githubReady: true,
        demoMode: false,
      }),
      false,
    );
  });
});
