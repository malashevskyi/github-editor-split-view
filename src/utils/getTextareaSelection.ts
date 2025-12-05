interface TextareaSelection {
  textarea: HTMLTextAreaElement;
  fullText: string;
  selectedText: string;
  beforeText: string;
  afterText: string;
  start: number;
  end: number;
}

/**
 * Extracts selection data from a textarea element.
 *
 * WHY: When formatting text, we need to know:
 * 1. What text is selected (to wrap it with markdown symbols)
 * 2. What's before/after the selection (to reconstruct the full text)
 * 3. Cursor positions (to restore selection after formatting)
 *
 * The textarea API provides selectionStart/selectionEnd, but we need
 * to calculate the text parts ourselves. This helper does it once
 * instead of repeating the substring logic everywhere.
 *
 * Returns null if textarea is missing, preventing errors in edge cases
 * (e.g., editor being removed from DOM during formatting).
 */
export function getTextareaSelection(
  textarea: HTMLTextAreaElement,
): TextareaSelection | null {
  if (!textarea) return null;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const fullText = textarea.value;

  return {
    textarea,
    fullText,
    selectedText: fullText.substring(start, end),
    beforeText: fullText.substring(0, start),
    afterText: fullText.substring(end),
    start,
    end,
  };
}
