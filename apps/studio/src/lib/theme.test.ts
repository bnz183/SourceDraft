import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyTheme,
  applyThemeAttribute,
  getStoredTheme,
  initTheme,
  nextTheme,
  normalizeTheme,
  storeTheme,
  themeLabel,
  THEME_STORAGE_KEY,
} from "./theme.ts";

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    map,
  };
}

function fakeRoot() {
  const attrs: Record<string, string> = {};
  return {
    setAttribute: (name: string, value: string) => {
      attrs[name] = value;
    },
    removeAttribute: (name: string) => {
      delete attrs[name];
    },
    attrs,
  };
}

test("normalizeTheme falls back to system for unknown values", () => {
  assert.equal(normalizeTheme("light"), "light");
  assert.equal(normalizeTheme("dark"), "dark");
  assert.equal(normalizeTheme("system"), "system");
  assert.equal(normalizeTheme("nope"), "system");
  assert.equal(normalizeTheme(undefined), "system");
});

test("getStoredTheme reads a valid stored preference", () => {
  assert.equal(getStoredTheme(fakeStorage({ [THEME_STORAGE_KEY]: "dark" })), "dark");
});

test("getStoredTheme defaults to system when nothing is stored", () => {
  assert.equal(getStoredTheme(fakeStorage()), "system");
});

test("storeTheme round-trips through storage", () => {
  const storage = fakeStorage();
  storeTheme("light", storage);
  assert.equal(storage.map.get(THEME_STORAGE_KEY), "light");
});

test("applyThemeAttribute sets explicit themes and clears for system", () => {
  const root = fakeRoot();
  applyThemeAttribute("dark", root);
  assert.equal(root.attrs["data-theme"], "dark");
  applyThemeAttribute("light", root);
  assert.equal(root.attrs["data-theme"], "light");
  applyThemeAttribute("system", root);
  assert.equal(root.attrs["data-theme"], undefined);
});

test("applyTheme persists and reflects on the root", () => {
  const storage = fakeStorage();
  const root = fakeRoot();
  assert.equal(applyTheme("dark", { storage, root }), "dark");
  assert.equal(root.attrs["data-theme"], "dark");
  assert.equal(storage.map.get(THEME_STORAGE_KEY), "dark");
});

test("initTheme applies the stored preference", () => {
  const storage = fakeStorage({ [THEME_STORAGE_KEY]: "light" });
  const root = fakeRoot();
  assert.equal(initTheme({ storage, root }), "light");
  assert.equal(root.attrs["data-theme"], "light");
});

test("nextTheme cycles system -> light -> dark -> system", () => {
  assert.equal(nextTheme("system"), "light");
  assert.equal(nextTheme("light"), "dark");
  assert.equal(nextTheme("dark"), "system");
});

test("themeLabel returns a readable label", () => {
  assert.equal(themeLabel("light"), "Light");
  assert.equal(themeLabel("dark"), "Dark");
  assert.equal(themeLabel("system"), "System");
});
