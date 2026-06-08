import type { KeyboardEvent, RefObject } from "react";
import {
  actionForShortcut,
  applyMarkdownAction,
  applyResultToTextarea,
  selectionFromTextarea,
  type MarkdownAction,
} from "../lib/markdownEditor.js";

type ToolbarButton = {
  action: MarkdownAction;
  label: string;
  ariaLabel: string;
  text: string;
};

const TOOLBAR_BUTTONS: ToolbarButton[] = [
  { action: "h1", label: "H1", ariaLabel: "Heading 1", text: "H1" },
  { action: "h2", label: "H2", ariaLabel: "Heading 2", text: "H2" },
  { action: "h3", label: "H3", ariaLabel: "Heading 3", text: "H3" },
  { action: "bold", label: "Bold", ariaLabel: "Bold", text: "B" },
  { action: "italic", label: "Italic", ariaLabel: "Italic", text: "I" },
  { action: "link", label: "Link", ariaLabel: "Insert link", text: "Link" },
  {
    action: "bullet-list",
    label: "Bullet list",
    ariaLabel: "Bullet list",
    text: "• List",
  },
  {
    action: "numbered-list",
    label: "Numbered list",
    ariaLabel: "Numbered list",
    text: "1. List",
  },
  {
    action: "blockquote",
    label: "Blockquote",
    ariaLabel: "Blockquote",
    text: "Quote",
  },
  {
    action: "inline-code",
    label: "Inline code",
    ariaLabel: "Inline code",
    text: "Code",
  },
  {
    action: "code-block",
    label: "Code block",
    ariaLabel: "Code block",
    text: "```",
  },
  {
    action: "image",
    label: "Image",
    ariaLabel: "Insert image",
    text: "Image",
  },
];

type MarkdownToolbarProps = {
  body: string;
  bodyFieldId: string;
  latestImagePath: string | null;
  imageAlt: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onBodyChange: (body: string) => void;
};

export function MarkdownToolbar({
  body,
  bodyFieldId,
  latestImagePath,
  imageAlt,
  textareaRef,
  onBodyChange,
}: MarkdownToolbarProps) {
  function runAction(action: MarkdownAction) {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const selection = selectionFromTextarea(textarea);

    if (action === "image") {
      const path =
        latestImagePath?.trim() ||
        window.prompt("Image path (public URL or repo path)", "/images/")?.trim() ||
        "";

      if (path.length === 0) {
        return;
      }

      const result = applyMarkdownAction(body, selection, action, {
        imagePath: path,
        imageAlt,
      });
      onBodyChange(result.value);
      requestAnimationFrame(() => {
        applyResultToTextarea(textarea, result);
      });
      return;
    }

    const result = applyMarkdownAction(body, selection, action);
    onBodyChange(result.value);
    requestAnimationFrame(() => {
      applyResultToTextarea(textarea, result);
    });
  }

  return (
    <div
      className="editor-toolbar"
      role="toolbar"
      aria-label="Markdown formatting"
      aria-controls={bodyFieldId}
    >
      {TOOLBAR_BUTTONS.map((button) => (
        <button
          key={button.action}
          type="button"
          className="editor-toolbar__button"
          aria-label={button.ariaLabel}
          title={button.label}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={() => {
            runAction(button.action);
          }}
        >
          <span aria-hidden="true">{button.text}</span>
        </button>
      ))}
    </div>
  );
}

export function handleMarkdownShortcut(
  event: KeyboardEvent<HTMLTextAreaElement>,
  body: string,
  onBodyChange: (body: string) => void,
): boolean {
  if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) {
    return false;
  }

  const action = actionForShortcut(event.key);
  if (!action) {
    return false;
  }

  event.preventDefault();
  const textarea = event.currentTarget;
  const selection = selectionFromTextarea(textarea);
  const result = applyMarkdownAction(body, selection, action);
  onBodyChange(result.value);
  requestAnimationFrame(() => {
    applyResultToTextarea(textarea, result);
  });
  return true;
}
