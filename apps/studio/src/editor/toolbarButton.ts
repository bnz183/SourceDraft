export type EditorMode = "rich" | "source";

/**
 * A toolbar control may only run its command when it is not individually
 * disabled and the editor is in rich mode. Centralizing the rule keeps the
 * `disabled` attribute and the click handler in sync, so a disabled button can
 * never execute its action even if the native disabled state is bypassed.
 */
export function isToolbarButtonEnabled(
  disabled: boolean | undefined,
  editorMode: EditorMode,
): boolean {
  return disabled !== true && editorMode === "rich";
}
