import type { View } from "../types/view";

export type NavItem = {
  /** The view this item activates. */
  view: View;
  /** Visible label and accessible name. */
  label: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { view: "dashboard", label: "Dashboard" },
  { view: "editor", label: "Posts" },
  { view: "settings", label: "Settings" },
];

export function isNavItemActive(item: NavItem, currentView: View): boolean {
  return item.view === currentView;
}
