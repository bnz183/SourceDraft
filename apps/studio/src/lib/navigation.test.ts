import assert from "node:assert/strict";
import { test } from "node:test";
import { NAV_ITEMS, isNavItemActive } from "./navigation.js";

test("nav exposes Posts and Settings destinations", () => {
  assert.deepEqual(
    NAV_ITEMS.map((item) => item.label),
    ["Posts", "Settings"],
  );
  assert.deepEqual(
    NAV_ITEMS.map((item) => item.view),
    ["editor", "settings"],
  );
});

test("isNavItemActive matches the current view", () => {
  const [posts, settings] = NAV_ITEMS;
  assert.equal(isNavItemActive(posts, "editor"), true);
  assert.equal(isNavItemActive(posts, "settings"), false);
  assert.equal(isNavItemActive(settings, "settings"), true);
  assert.equal(isNavItemActive(settings, "editor"), false);
});
