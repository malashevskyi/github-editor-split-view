import { FORMAT_TYPES } from "../constants/formatTypes";

/**
 * Shared formatting logic helpers.
 */

/**
 * Checks if selected text should be unformatted (remove existing markdown).
 *
 * WHY: Formatting buttons should work as toggles:
 * - Click "Bold" on normal text → adds **text**
 * - Click "Bold" on **text** → removes **, leaving text
 */
export function shouldUnformat(
  selectedText: string,
  prefix: string,
  suffix: string,
): boolean {
  if (selectedText.length === 0) return false;

  // Check if text has both prefix and suffix (e.g., **bold**)
  if (prefix.length > 0 && suffix.length > 0) {
    return selectedText.startsWith(prefix) && selectedText.endsWith(suffix);
  }

  // Check if text has only prefix (e.g., ### heading)
  if (prefix.length > 0 && suffix.length === 0) {
    return selectedText.startsWith(prefix);
  }

  return false;
}

/**
 * Removes formatting symbols from text.
 *
 * WHY: When unformatting, we need to cleanly remove the markdown symbols
 * without leaving extra spaces or partial symbols.
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
 * Applies markdown formatting to text (single line or multiline).
 *
 * WHY: Different markdown formats behave differently:
 *
 * 1. Single-line formats (bold, italic, code):
 *    "hello" → "**hello**"
 *
 * 2. Multi-line formats with prefix on each line (lists, quotes):
 *    "line1\nline2" → "- line1\n- line2"
 *
 * 3. Ordered lists need incrementing numbers:
 *    "line1\nline2" → "1. line1\n2. line2"
 *
 * 4. Empty selection just inserts symbols:
 *    "" → "****" (user can type between the *)
 */
export function applyFormatting(
  selectedText: string,
  formatType: string,
  prefix: string,
  suffix: string,
  isMultilineFormat: boolean,
): string {
  // No selection - just return formatting symbols for user to type into
  if (selectedText.length === 0) {
    return prefix + suffix;
  }

  const isSelectionMultiline = selectedText.includes("\n");

  // Multiline formatting (lists, quotes, etc.)
  if (isSelectionMultiline && isMultilineFormat) {
    if (formatType === FORMAT_TYPES.OL) {
      // Ordered list needs incrementing numbers
      return selectedText
        .split("\n")
        .map((line, index) => `${index + 1}. ${line}`)
        .join("\n");
    } else {
      // Other multiline formats just add prefix to each line
      return selectedText
        .split("\n")
        .map((line) => `${prefix}${line}`)
        .join("\n");
    }
  }

  // Single line formatting - wrap with prefix/suffix
  return prefix + selectedText + suffix;
}
