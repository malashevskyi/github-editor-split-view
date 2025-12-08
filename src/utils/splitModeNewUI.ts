import { SELECTORS } from "../constants/selectors";
import { LAYOUT } from "../constants/layout";
import { saveOriginalStyle, setStyle } from "./splitModeHelpers";

/**
 * Apply split mode styles for NEW UI (Issues/Comments).
 */
export function applyNewUISplitMode(
  writeArea: HTMLElement,
  previewArea: HTMLElement,
  header: HTMLElement | null,
  styles: Map<HTMLElement, string>,
): void {
  saveOriginalStyle(writeArea, styles);

  const span = writeArea.querySelector<HTMLElement>(SELECTORS.TEXTAREA_SPAN);
  const textarea = writeArea.querySelector<HTMLTextAreaElement>(
    SELECTORS.TEXTAREA,
  );

  if (span) {
    saveOriginalStyle(span, styles);
    // Force show span (GitHub adds .MarkdownInput-module__displayNone--... class and we can do nothing with this in CSS like with other elements)
    setStyle(span, "display", "block");
  }

  if (textarea) {
    // Force max-height to allow scrolling
    textarea.style.setProperty("max-height", LAYOUT.MAX_HEIGHT, "important");
    textarea.style.removeProperty("box-sizing");
  }

  // Move preview into writeArea (as 2nd column)
  if (previewArea && span) {
    saveOriginalStyle(previewArea, styles);

    if (previewArea.parentElement !== writeArea) {
      // Insert preview right after the span
      if (span.nextSibling) {
        writeArea.insertBefore(previewArea, span.nextSibling);
      } else {
        writeArea.appendChild(previewArea);
      }
    }
  }

  // Show header
  if (header) {
    saveOriginalStyle(header, styles);
  }
}
