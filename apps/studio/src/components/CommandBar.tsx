import type { View } from "../types/view";

type CommandBarProps = {
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
};

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: "overview", label: "Posts" },
  { id: "new-article", label: "Write" },
  { id: "settings", label: "Settings" },
];

export function CommandBar({
  currentView,
  onViewChange,
  onLogout,
}: CommandBarProps) {
  return (
    <header className="command-bar">
      <div className="command-bar__brand">
        <span className="command-bar__mark">SD</span>
        <div>
          <p className="command-bar__title">SourceDraft Studio</p>
          <p className="command-bar__subtitle">Write, preview, and publish to GitHub</p>
        </div>
      </div>

      <nav className="command-bar__nav" aria-label="Studio views">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              currentView === item.id
                ? "command-bar__nav-item command-bar__nav-item--active"
                : "command-bar__nav-item"
            }
            aria-current={currentView === item.id ? "page" : undefined}
            onClick={() => onViewChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="command-bar__status">
        <span className="command-bar__status-label">Auth</span>
        <span className="command-bar__status-value">Signed in</span>
        <button
          type="button"
          className="button button--compact command-bar__logout"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
