import { getFormatSymbols } from "./getFormatSymbols";
import {
  shouldUnformat,
  unformatText,
  applyFormatting,
} from "./formattingHelpers";

/**
 * Applies markdown formatting to contenteditable elements (README editor).
 *
 * WHY: GitHub's README editor uses CodeMirror 6, which renders as a
 * contenteditable <div> instead of a <textarea>. CodeMirror doesn't expose
 * its EditorView API on the DOM element, so we can't use CodeMirror's APIs.
 *
 * PROBLEM: We need to make toolbar buttons work, but:
 * - Can't use textarea.value (it's not a textarea)
 * - Can't use CodeMirror API (not exposed)
 * - Must use browser's native Selection API instead
 *
 * SOLUTION: Work with the DOM directly using:
 * - window.getSelection() - get what text is selected
 * - Range API - manipulate text within the selection
 * - createTextNode() - insert formatted text
 * - setStart/setEnd - restore cursor position
 *
 * WHY THIS IS COMPLEX: Unlike textarea (simple string manipulation),
 * contenteditable works with DOM nodes. We must:
 * 1. Extract text from selection
 * 2. Delete the old DOM nodes
 * 3. Create new text node with formatting
 * 4. Insert it in the right place
 * 5. Restore the selection
 *
 * This makes the extension work on README files where GitHub uses
 * CodeMirror, even though we can't access CodeMirror's JavaScript API.
 *
 * @param formatType The markdown format to apply
 * @param contentEditableElement The CodeMirror contenteditable div
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
    // Get current selection using browser's Selection API
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    const { prefix, suffix, isMultilineFormat } = getFormatSymbols(formatType);

    // If already formatted, remove formatting (toggle behavior)
    if (shouldUnformat(selectedText, prefix, suffix)) {
      const newText = unformatText(selectedText, prefix, suffix);

      // Replace selected DOM nodes with unformatted text
      range.deleteContents();
      const textNode = document.createTextNode(newText);
      range.insertNode(textNode);

      // Restore selection on the unformatted text
      const newRange = document.createRange();
      newRange.setStart(textNode, 0);
      newRange.setEnd(textNode, newText.length);
      selection.removeAllRanges();
      selection.addRange(newRange);

      // Notify GitHub/CodeMirror that content changed
      contentEditableElement.dispatchEvent(
        new Event("input", { bubbles: true }),
      );
      return;
    }

    // Apply formatting to selection
    const replacement = applyFormatting(
      selectedText,
      formatType,
      prefix,
      suffix,
      isMultilineFormat,
    );

    // Replace selected DOM nodes with formatted text
    range.deleteContents();
    const textNode = document.createTextNode(replacement);
    range.insertNode(textNode);

    // Set cursor position:
    // - If nothing selected: place cursor between symbols
    // - If text selected: select the newly formatted text
    const newRange = document.createRange();
    if (selectedText.length === 0) {
      // Move cursor between prefix and suffix (e.g., **|**)
      newRange.setStart(textNode, prefix.length);
      newRange.setEnd(textNode, prefix.length);
    } else {
      // Select the newly formatted text
      newRange.setStart(textNode, 0);
      newRange.setEnd(textNode, replacement.length);
    }
    selection.removeAllRanges();
    selection.addRange(newRange);

    // Trigger events to notify GitHub/CodeMirror
    contentEditableElement.dispatchEvent(new Event("input", { bubbles: true }));
    contentEditableElement.dispatchEvent(
      new Event("change", { bubbles: true }),
    );
    contentEditableElement.focus();
  } catch (error) {
    console.error("[formatContentEditable] Error during formatting:", error);
  }
}
