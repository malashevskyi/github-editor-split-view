import { getFormatSymbols } from "./getFormatSymbols";
import {
  shouldUnformat,
  unformatText,
  applyFormatting,
} from "./formattingHelpers";

/**
 * Handles text formatting for contenteditable elements (used in GitHub's CodeMirror-based README editor).
 *
 * GitHub's CodeMirror implementation uses contenteditable divs, not the full EditorView API.
 *
 * @param formatType The type of Markdown formatting to apply
 * @param contentEditableElement The contenteditable element
 */
export function formatContentEditable(
  formatType: string,
  contentEditableElement: HTMLElement,
): void {
  if (
    !contentEditableElement ||
    contentEditableElement.getAttribute("contenteditable") !== "true"
  ) {
    return;
  }

  try {
    // Get current selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    const { prefix, suffix, isMultilineFormat } = getFormatSymbols(formatType);

    // Check if we should remove formatting
    if (shouldUnformat(selectedText, prefix, suffix)) {
      const newText = unformatText(selectedText, prefix, suffix);

      range.deleteContents();
      const textNode = document.createTextNode(newText);
      range.insertNode(textNode);

      // Restore selection on the unformatted text
      const newRange = document.createRange();
      newRange.setStart(textNode, 0);
      newRange.setEnd(textNode, newText.length);
      selection.removeAllRanges();
      selection.addRange(newRange);

      contentEditableElement.dispatchEvent(
        new Event("input", { bubbles: true }),
      );
      return;
    }

    // Apply formatting
    const replacement = applyFormatting(
      selectedText,
      formatType,
      prefix,
      suffix,
      isMultilineFormat,
    );

    range.deleteContents();
    const textNode = document.createTextNode(replacement);
    range.insertNode(textNode);

    // Set cursor position
    const newRange = document.createRange();
    if (selectedText.length === 0) {
      // Move cursor between prefix and suffix
      newRange.setStart(textNode, prefix.length);
      newRange.setEnd(textNode, prefix.length);
    } else {
      // Select formatted text
      newRange.setStart(textNode, 0);
      newRange.setEnd(textNode, replacement.length);
    }
    selection.removeAllRanges();
    selection.addRange(newRange);

    // Trigger events to notify GitHub
    contentEditableElement.dispatchEvent(new Event("input", { bubbles: true }));
    contentEditableElement.dispatchEvent(
      new Event("change", { bubbles: true }),
    );
    contentEditableElement.focus();
  } catch (error) {
    console.error("[formatContentEditable] Error during formatting:", error);
  }
}
