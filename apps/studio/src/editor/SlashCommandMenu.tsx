import type { SlashCommandItem } from "./slashCommands.js";

type SlashCommandMenuProps = {
  items: SlashCommandItem[];
  selectedIndex: number;
  onSelect: (item: SlashCommandItem) => void;
};

export function SlashCommandMenu({
  items,
  selectedIndex,
  onSelect,
}: SlashCommandMenuProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="slash-command-menu" role="listbox" aria-label="Slash commands">
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          role="option"
          aria-selected={index === selectedIndex}
          className={
            index === selectedIndex
              ? "slash-command-menu__item slash-command-menu__item--active"
              : "slash-command-menu__item"
          }
          onMouseDown={(event) => {
            event.preventDefault();
            onSelect(item);
          }}
        >
          <span className="slash-command-menu__label">{item.label}</span>
          <span className="slash-command-menu__hint">{item.description}</span>
        </button>
      ))}
    </div>
  );
}
