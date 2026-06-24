import assert from "node:assert/strict";
import { test } from "node:test";
import { NAV_ITEMS, isNavItemActive } from "./navigation.js";

test("nav exposes Dashboard, Posts, and Settings destinations", () => {
  assert.deepEqual(
    NAV_ITEMS.map((item) => item.label),
    ["Dashboard", "Posts", "Settings"],
  );
  assert.deepEqual(
    NAV_ITEMS.map((item) => item.view),
    ["dashboard", "editor", "settings"],
  );
});

test("isNavItemActive matches the current view", () => {
  const [dashboard, posts, settings] = NAV_ITEMS;
  assert.equal(isNavItemActive(dashboard, "dashboard"), true);
  assert.equal(isNavItemActive(dashboard, "editor"), false);
  assert.equal(isNavItemActive(posts, "editor"), true);
  assert.equal(isNavItemActive(posts, "settings"), false);
  assert.equal(isNavItemActive(settings, "settings"), true);
  assert.equal(isNavItemActive(settings, "editor"), false);
});
