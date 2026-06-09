import { Extension } from "@tiptap/core";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";

export type SlashCommandId =
  | "h1"
  | "h2"
  | "h3"
  | "quote"
  | "code"
  | "image"
  | "hr"
  | "link"
  | "internal"
  | "callout";

export type SlashCommandItem = {
  id: SlashCommandId;
  label: string;
  description: string;
};

export const SLASH_COMMANDS: SlashCommandItem[] = [
  { id: "h1", label: "Heading 1", description: "/h1" },
  { id: "h2", label: "Heading 2", description: "/h2" },
  { id: "h3", label: "Heading 3", description: "/h3" },
  { id: "quote", label: "Blockquote", description: "/quote" },
  { id: "code", label: "Code block", description: "/code" },
  { id: "image", label: "Image", description: "/image" },
  { id: "hr", label: "Horizontal rule", description: "/hr" },
  { id: "link", label: "Link", description: "/link" },
  { id: "internal", label: "Internal link", description: "/internal" },
  { id: "callout", label: "Callout", description: "/callout" },
];

export type SlashCommandHandlers = {
  onCommand: (command: SlashCommandId) => void;
};

export function filterSlashCommands(query: string): SlashCommandItem[] {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) {
    return SLASH_COMMANDS;
  }

  return SLASH_COMMANDS.filter(
    (command) =>
      command.id.includes(normalized) ||
      command.label.toLowerCase().includes(normalized),
  );
}

type SlashSuggestionRender = NonNullable<
  SuggestionOptions<SlashCommandItem>["render"]
>;

export function createSlashCommandsExtension(
  handlers: SlashCommandHandlers,
  render: SlashSuggestionRender,
): Extension {
  return Extension.create({
    name: "slashCommands",

    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          char: "/",
          allowSpaces: false,
          startOfLine: false,
          items: ({ query }) => filterSlashCommands(query),
          command: ({ editor, range, props }) => {
            editor.chain().focus().deleteRange(range).run();
            handlers.onCommand(props.id);
          },
          render,
        }),
      ];
    },
  });
}
