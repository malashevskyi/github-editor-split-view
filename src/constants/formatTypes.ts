/**
 * Markdown format types supported by the toolbar.
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
  MENTION: "mention",
  REFERENCE: "reference",
} as const;

export type FormatType = (typeof FORMAT_TYPES)[keyof typeof FORMAT_TYPES];
