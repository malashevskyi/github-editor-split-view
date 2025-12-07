import { SELECTORS } from "../constants/selectors";
import { TIMINGS } from "../constants/timings";
import { LAYOUT } from "../constants/layout";
import {
  saveOriginalStyle,
  setStyle,
  calculateTextareaHeightOldUI,
  clickPreviewTab,
} from "./splitModeHelpers";

/**
 * Apply split mode styles for OLD PR UI (Pull Request comments).
 */
export function applyOldPRSplitMode(
  wrapper: HTMLElement,
  writeArea: HTMLElement,
  previewArea: HTMLElement,
  header: HTMLElement | null,
  styles: Map<HTMLElement, string>,
): (() => void) | undefined {
  // Old PR UI: Apply grid to wrapper (tab-container)
  setStyle(wrapper, "display", "grid");
  setStyle(wrapper, "grid-template-columns", LAYOUT.SPLIT_COLUMNS);
  setStyle(wrapper, "grid-template-rows", "auto 1fr");

  // Header spans both columns (100% width)
  if (header) {
    saveOriginalStyle(header, styles);
    setStyle(header, "display", "flex");
    header.style.gridColumn = "1 / 3";
    header.style.gridRow = "1";
  }

  // Remove hidden attribute from writeArea
  saveOriginalStyle(writeArea, styles);
  writeArea.removeAttribute("hidden");
  setStyle(writeArea, "display", "block");
  setStyle(writeArea, "grid-column", "1");
  setStyle(writeArea, "grid-row", "2");

  // Position preview in 2nd column
  saveOriginalStyle(previewArea, styles);
  setStyle(previewArea, "display", "block");
  setStyle(previewArea, "grid-column", "2");
  setStyle(previewArea, "grid-row", "2");
  setStyle(previewArea, "overflow-y", "auto");
  setStyle(previewArea, "max-height", LAYOUT.MAX_HEIGHT);

  // Set initial preview height to match textarea
  const textarea = writeArea?.querySelector<HTMLTextAreaElement>(
    SELECTORS.TEXTAREA,
  );
  if (textarea) {
    const textareaHeight = calculateTextareaHeightOldUI(textarea);
    setStyle(previewArea, "height", `${textareaHeight}px`);
  }

  // Simulate click on Preview tab to refresh content
  clickPreviewTab(wrapper);

  // Setup auto-refresh: watch textarea changes
  if (textarea) {
    let refreshTimeout: ReturnType<typeof setTimeout>;

    const handleTextareaChange = () => {
      // Update preview height to match textarea dynamically
      const textareaHeight = calculateTextareaHeightOldUI(textarea);
      setStyle(previewArea, "height", `${textareaHeight}px`);

      // Debounce: refresh preview 500ms after user stops typing
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        clickPreviewTab(wrapper);
      }, TIMINGS.PREVIEW_REFRESH_DEBOUNCE);
    };

    textarea.addEventListener("input", handleTextareaChange);

    // Return cleanup function
    return () => {
      textarea.removeEventListener("input", handleTextareaChange);
      clearTimeout(refreshTimeout);
    };
  }

  return undefined;
}
