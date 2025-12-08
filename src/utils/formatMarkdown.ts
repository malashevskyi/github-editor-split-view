import { formatText } from "./formatText";
import { formatContentEditable } from "./formatContentEditable";

/**
 * Universal markdown formatter that automatically detects editor type.
 *
 * WHY: GitHub uses two completely different editor technologies:
 *
 * 1. **Issues/Comments/Discussions**: Plain HTML <textarea>
 *    - Access text via: textarea.value
 *
 * 2. **README files**: CodeMirror 6 contenteditable div
 *    - Access text via: DOM manipulation (window.getSelection, Range API)
 *
 * This wrapper function detects which editor type we're dealing with
 *
 * @param formatType The markdown format to apply (bold, italic, etc.)
 * @param editorElement The editor element (detected automatically)
 */
export function formatMarkdown(
  formatType: string,
  editorElement: HTMLElement | HTMLTextAreaElement,
): void {
  // Issues/comments editors use textarea element
  if (editorElement instanceof HTMLTextAreaElement) {
    formatText(formatType, editorElement);
    return;
  }

  // README editor uses contenteditable div (CodeMirror)
  if (editorElement.getAttribute("contenteditable") === "true") {
    formatContentEditable(formatType, editorElement);
    return;
  }

  // Should never happen, but log if we encounter unknown editor type
  console.error("[formatMarkdown] Unsupported editor type:", editorElement);
}
