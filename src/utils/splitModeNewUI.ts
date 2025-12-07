import { SELECTORS } from "../constants/selectors";
import { LAYOUT } from "../constants/layout";
import { saveOriginalStyle, setStyle } from "./splitModeHelpers";

/**
 * Apply split mode styles for NEW UI (Issues/Comments).
 */
export function applyNewUISplitMode(
  wrapper: HTMLElement,
  writeArea: HTMLElement,
  previewArea: HTMLElement,
  header: HTMLElement | null,
  styles: Map<HTMLElement, string>,
): void {
  // New UI: Apply grid to writeArea
  wrapper.style.removeProperty("display");
  wrapper.style.removeProperty("grid-template-columns");
  wrapper.style.removeProperty("grid-template-rows");

  saveOriginalStyle(writeArea, styles);

  // Apply grid to writeArea to split editor and preview
  setStyle(writeArea, "display", "grid");
  setStyle(writeArea, "grid-template-columns", LAYOUT.SPLIT_COLUMNS);
  setStyle(writeArea, "height", "auto");

  const span = writeArea.querySelector<HTMLElement>(SELECTORS.TEXTAREA_SPAN);
  const textarea = writeArea.querySelector<HTMLTextAreaElement>(
    SELECTORS.TEXTAREA,
  );

  if (span) {
    saveOriginalStyle(span, styles);
    setStyle(span, "display", "block");
  }

  if (textarea) {
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

    setStyle(previewArea, "height", "100%");
    setStyle(previewArea, "max-height", LAYOUT.MAX_HEIGHT);
    setStyle(previewArea, "overflow-y", "auto");
  }

  // Show header with grid styles
  if (header) {
    saveOriginalStyle(header, styles);
    setStyle(header, "display", "flex");
    header.style.gridColumn = "1 / 3";
  }
}
