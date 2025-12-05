import { getFormatSymbols } from "./getFormatSymbols";
import { getTextareaSelection } from "./getTextareaSelection";
import { triggerInputEvent } from "./triggerInputEvent";
import {
  shouldUnformat,
  unformatText,
  applyFormatting,
} from "./formattingHelpers";

/**
 * Applies markdown formatting to textarea-based editors (Issues/Comments).
 *
 * WHY: GitHub's native toolbar buttons stop working in our split view because:
 * 1. GitHub hides the toolbar when Preview tab is active
 * 2. We clone the toolbar to keep it visible
 * 3. Cloned buttons lose their original event listeners
 *
 * So we need to re-implement the formatting logic ourselves for textareas.
 *
 * HOW IT WORKS:
 * 1. Get current selection (what text is highlighted)
 * 2. Check if already formatted → if yes, remove formatting (toggle off)
 * 3. If not formatted → add markdown symbols around selection
 * 4. Restore cursor position so user can continue typing
 * 5. Trigger 'input' event so GitHub's preview updates
 *
 * This makes our toolbar buttons behave identically to GitHub's native ones,
 * but they work even when GitHub's toolbar is hidden.
 *
 * @param formatType The markdown format to apply (bold, italic, etc.)
 * @param textarea The textarea element to format
 */
export function formatText(
  formatType: string,
  textarea: HTMLTextAreaElement,
): void {
  const selection = getTextareaSelection(textarea);
  if (!selection) return;

  const { selectedText, beforeText, afterText, start } = selection;
  const { prefix, suffix, isMultilineFormat } = getFormatSymbols(formatType);

  // If text is already formatted, remove formatting (toggle behavior)
  if (shouldUnformat(selectedText, prefix, suffix)) {
    const newSelectedText = unformatText(selectedText, prefix, suffix);
    textarea.value = beforeText + newSelectedText + afterText;
    // Restore selection (cursor stays in same place)
    textarea.selectionStart = start;
    textarea.selectionEnd = start + newSelectedText.length;
    triggerInputEvent(textarea);
    textarea.focus();
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
  textarea.value = beforeText + replacement + afterText;

  // Set cursor position:
  // - If nothing selected: place cursor between symbols (e.g., **|**)
  // - If text selected: select the newly formatted text
  if (selectedText.length === 0) {
    textarea.selectionStart = textarea.selectionEnd = start + prefix.length;
  } else {
    textarea.selectionStart = start;
    textarea.selectionEnd = start + replacement.length;
  }

  triggerInputEvent(textarea);
  textarea.focus();
}
