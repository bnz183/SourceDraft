export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "sourcedraft-theme";

const VALID: readonly ThemePreference[] = ["light", "dark", "system"];

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === "string" && VALID.includes(value as ThemePreference);
}

export function normalizeTheme(value: unknown): ThemePreference {
  return isThemePreference(value) ? value : "system";
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;
type RootLike = {
  setAttribute: (name: string, value: string) => void;
  removeAttribute: (name: string) => void;
};

function getStorage(storage?: StorageLike): StorageLike | null {
  if (storage) {
    return storage;
  }
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function getRoot(root?: RootLike): RootLike | null {
  return (
    root ?? (typeof document !== "undefined" ? document.documentElement : null)
  );
}

export function getStoredTheme(storage?: StorageLike): ThemePreference {
  const store = getStorage(storage);
  if (!store) {
    return "system";
  }
  try {
    return normalizeTheme(store.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

export function storeTheme(theme: ThemePreference, storage?: StorageLike): void {
  const store = getStorage(storage);
  if (!store) {
    return;
  }
  try {
    store.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* storage unavailable — preference still applies for this session */
  }
}

// "system" removes the attribute so the prefers-color-scheme rules govern;
// "light"/"dark" set an explicit override.
export function applyThemeAttribute(theme: ThemePreference, root?: RootLike): void {
  const target = getRoot(root);
  if (!target) {
    return;
  }
  if (normalizeTheme(theme) === "system") {
    target.removeAttribute("data-theme");
  } else {
    target.setAttribute("data-theme", theme);
  }
}

export function applyTheme(
  theme: ThemePreference,
  options?: { storage?: StorageLike; root?: RootLike },
): ThemePreference {
  const normalized = normalizeTheme(theme);
  applyThemeAttribute(normalized, options?.root);
  storeTheme(normalized, options?.storage);
  return normalized;
}

export function initTheme(options?: {
  storage?: StorageLike;
  root?: RootLike;
}): ThemePreference {
  const theme = getStoredTheme(options?.storage);
  applyThemeAttribute(theme, options?.root);
  return theme;
}

const NEXT_THEME: Record<ThemePreference, ThemePreference> = {
  system: "light",
  light: "dark",
  dark: "system",
};

export function nextTheme(theme: ThemePreference): ThemePreference {
  return NEXT_THEME[normalizeTheme(theme)];
}

export function themeLabel(theme: ThemePreference): string {
  switch (normalizeTheme(theme)) {
    case "light":
      return "Light";
    case "dark":
      return "Dark";
    default:
      return "System";
  }
}
