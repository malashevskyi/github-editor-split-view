import { FORMAT_TYPES } from "../constants/formatTypes";

interface FormatSymbols {
  prefix: string;
  suffix: string;
  isMultilineFormat: boolean;
}

/**
 * Returns markdown symbols (prefix/suffix) for each format type.
 *
 * WHY: Different markdown formats require different wrapping symbols:
 * - Bold wraps text: **text**
 * - Heading prefixes line: ### text
 * - Lists need prefix on each line: - item
 *
 * The isMultilineFormat flag tells us whether to apply formatting to
 * each line individually (lists, quotes) or to the whole selection (bold, italic).
 *
 * This prevents code duplication across formatText and formatContentEditable,
 * ensuring both textarea and CodeMirror editors use the same markdown syntax.
 */
export function getFormatSymbols(formatType: string): FormatSymbols {
  switch (formatType) {
    case FORMAT_TYPES.HEADING:
      return { prefix: "### ", suffix: "", isMultilineFormat: false };
    case FORMAT_TYPES.BOLD:
      return { prefix: "**", suffix: "**", isMultilineFormat: false };
    case FORMAT_TYPES.ITALIC:
      return { prefix: "_", suffix: "_", isMultilineFormat: false };
    case FORMAT_TYPES.QUOTE:
      return { prefix: "> ", suffix: "", isMultilineFormat: true };
    case FORMAT_TYPES.CODE:
      return { prefix: "`", suffix: "`", isMultilineFormat: false };
    case FORMAT_TYPES.LINK:
      return { prefix: "[", suffix: "](url)", isMultilineFormat: false };
    case FORMAT_TYPES.UL:
      return { prefix: "- ", suffix: "", isMultilineFormat: true };
    case FORMAT_TYPES.OL:
      return { prefix: "1. ", suffix: "", isMultilineFormat: true };
    case FORMAT_TYPES.TASK:
      return { prefix: "- [ ] ", suffix: "", isMultilineFormat: true };
    case FORMAT_TYPES.MENTION:
      return { prefix: "@", suffix: "", isMultilineFormat: false };
    case FORMAT_TYPES.REFERENCE:
      return { prefix: "#", suffix: "", isMultilineFormat: false };
    default:
      return { prefix: "", suffix: "", isMultilineFormat: false };
  }
}
