import { getFormatSymbols } from './getFormatSymbols';
import { getTextareaSelection } from './getTextareaSelection';
import { triggerInputEvent } from './triggerInputEvent';

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
  textarea: HTMLTextAreaElement
): void {
  const selection = getTextareaSelection(textarea);
  if (!selection) return;

  const { selectedText, beforeText, afterText, start } = selection;
  const { prefix, suffix, isMultilineFormat } = getFormatSymbols(formatType);

  if (selectedText.length > 0) {
    let shouldUnformat = false;
    if (prefix.length > 0 && suffix.length > 0) {
      if (selectedText.startsWith(prefix) && selectedText.endsWith(suffix)) {
        shouldUnformat = true;
      }
    } else if (prefix.length > 0 && suffix.length === 0) {
      if (selectedText.startsWith(prefix)) {
        shouldUnformat = true;
      }
    }

    if (shouldUnformat) {
      const newSelectedText = selectedText.substring(
        prefix.length,
        selectedText.length - suffix.length
      );
      textarea.value = beforeText + newSelectedText + afterText;
      textarea.selectionStart = start;
      textarea.selectionEnd = start + newSelectedText.length;

      triggerInputEvent(textarea);

      textarea.focus();
      return;
    }
  }

  let replacement = '';
  if (selectedText.length === 0) {
    replacement = prefix + suffix;
    textarea.value = beforeText + replacement + afterText;
    textarea.selectionStart = textarea.selectionEnd = start + prefix.length;
  } else {
    const isSelectionMultiline = selectedText.includes('\n');
    if (isSelectionMultiline && isMultilineFormat) {
      if (formatType === 'ol') {
        replacement = selectedText
          .split('\n')
          .map((line, index) => `${index + 1}. ${line}`)
          .join('\n');
      } else {
        replacement = selectedText
          .split('\n')
          .map((line) => `${prefix}${line}`)
          .join('\n');
      }
    } else {
      replacement = prefix + selectedText + suffix;
    }
    textarea.value = beforeText + replacement + afterText;
    textarea.selectionStart = start;
    textarea.selectionEnd = start + replacement.length;
  }

  triggerInputEvent(textarea);

  textarea.focus();
}
