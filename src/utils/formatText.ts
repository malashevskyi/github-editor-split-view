import { getFormatSymbols } from "./getFormatSymbols";
import { getTextareaSelection } from "./getTextareaSelection";
import { triggerInputEvent } from "./triggerInputEvent";
import {
  shouldUnformat,
  unformatText,
  applyFormatting,
} from "./formattingHelpers";

/**
 * Handles manual text formatting for the cloned toolbar.
 *
 * CONTEXT: GitHub's native toolbar is removed from the DOM when the 'Preview' tab  is active.
 * We create a clone of the toolbar to maintain its appearance in our split view.
 * Because this is a clone, its buttons lack the original event listeners.
 *
 * This function just add Markdown symbols to the write area
 *
 * @param formatType The type of Markdown formatting to apply (e.g., 'bold', 'italic'),
 * @param textarea The textarea element where the formatting should be applied.
 */

export function formatText(
  formatType: string,
  textarea: HTMLTextAreaElement,
): void {
  const selection = getTextareaSelection(textarea);
  if (!selection) return;

  const { selectedText, beforeText, afterText, start } = selection;
  const { prefix, suffix, isMultilineFormat } = getFormatSymbols(formatType);

  if (shouldUnformat(selectedText, prefix, suffix)) {
    const newSelectedText = unformatText(selectedText, prefix, suffix);
    textarea.value = beforeText + newSelectedText + afterText;
    textarea.selectionStart = start;
    textarea.selectionEnd = start + newSelectedText.length;
    triggerInputEvent(textarea);
    textarea.focus();
    return;
  }

  const replacement = applyFormatting(
    selectedText,
    formatType,
    prefix,
    suffix,
    isMultilineFormat,
  );
  textarea.value = beforeText + replacement + afterText;

  // Set cursor position
  if (selectedText.length === 0) {
    textarea.selectionStart = textarea.selectionEnd = start + prefix.length;
  } else {
    textarea.selectionStart = start;
    textarea.selectionEnd = start + replacement.length;
  }

  triggerInputEvent(textarea);
  textarea.focus();
}
