/**
 * Markdown format types supported by the toolbar.
 *
 * WHY: Centralized constants prevent typos and make refactoring easier.
 * If GitHub changes their format type names, we only update them here.
 * Also provides type safety through TypeScript's type system.
 */
export const FORMAT_TYPES = {
  HEADING: "heading",
  BOLD: "bold",
  ITALIC: "italic",
  QUOTE: "quote",
  CODE: "code",
  LINK: "link",
  UL: "ul",
  OL: "ol",
  TASK: "task",
} as const;

export type FormatType = (typeof FORMAT_TYPES)[keyof typeof FORMAT_TYPES];
