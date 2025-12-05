import { FORMAT_TYPES } from "../constants/formatTypes";

/**
 * Shared formatting logic helpers.
 * These functions contain common logic used by both textarea and contenteditable formatters.
 */

/**
 * Checks if the selected text should be unformatted (remove existing markdown symbols).
 */
export function shouldUnformat(
  selectedText: string,
  prefix: string,
  suffix: string,
): boolean {
  if (selectedText.length === 0) return false;

  // Check if text has both prefix and suffix
  if (prefix.length > 0 && suffix.length > 0) {
    return selectedText.startsWith(prefix) && selectedText.endsWith(suffix);
  }

  // Check if text has only prefix
  if (prefix.length > 0 && suffix.length === 0) {
    return selectedText.startsWith(prefix);
  }

  return false;
}

/**
 * Removes formatting symbols from text.
 */
export function unformatText(
  selectedText: string,
  prefix: string,
  suffix: string,
): string {
  return selectedText.substring(
    prefix.length,
    selectedText.length - suffix.length,
  );
}

/**
 * Applies formatting to text (single line or multiline).
 */
export function applyFormatting(
  selectedText: string,
  formatType: string,
  prefix: string,
  suffix: string,
  isMultilineFormat: boolean,
): string {
  // No selection - just return formatting symbols
  if (selectedText.length === 0) {
    return prefix + suffix;
  }

  const isSelectionMultiline = selectedText.includes("\n");

  // Multiline formatting (lists, quotes, etc.)
  if (isSelectionMultiline && isMultilineFormat) {
    if (formatType === FORMAT_TYPES.OL) {
      return selectedText
        .split("\n")
        .map((line, index) => `${index + 1}. ${line}`)
        .join("\n");
    } else {
      return selectedText
        .split("\n")
        .map((line) => `${prefix}${line}`)
        .join("\n");
    }
  }

  // Single line formatting
  return prefix + selectedText + suffix;
}
