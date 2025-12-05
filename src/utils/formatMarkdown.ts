import { formatText } from "./formatText";
import { formatContentEditable } from "./formatContentEditable";

/**
 * Universal markdown formatter that automatically detects editor type and applies appropriate formatting.
 *
 * Handles two types of editors:
 * 1. textarea (Comments/Issues) - Simple HTML textarea element
 * 2. contenteditable (README) - CodeMirror-based contenteditable div
 *
 * @param formatType The type of Markdown formatting to apply
 * @param editorElement The editor element (textarea or contenteditable div)
 */
export function formatMarkdown(
  formatType: string,
  editorElement: HTMLElement | HTMLTextAreaElement,
): void {
  // issues/comments editors use textarea element
  if (editorElement instanceof HTMLTextAreaElement) {
    formatText(formatType, editorElement);
    return;
  }

  // README editor uses contenteditable div
  if (editorElement.getAttribute("contenteditable") === "true") {
    formatContentEditable(formatType, editorElement);
    return;
  }

  console.error("[formatMarkdown] Unsupported editor type:", editorElement);
}
