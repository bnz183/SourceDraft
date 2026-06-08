import type { KeyboardEvent } from "react";
import {
  actionForShortcut,
  applyMarkdownAction,
  applyResultToTextarea,
  selectionFromTextarea,
} from "./markdownEditor.js";

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
