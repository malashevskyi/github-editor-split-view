import { SELECTORS } from "../constants/selectors";
import { LAYOUT } from "../constants/layout";
import {
  saveOriginalStyle,
  setStyle,
  calculateEditorHeight,
} from "./splitModeHelpers";

/**
 * Apply split mode styles for README editor.
 */
export function applyReadmeSplitMode(
  wrapper: HTMLElement,
  writeArea: HTMLElement,
  previewArea: HTMLElement,
  header: HTMLElement | null,
  readmeScrollContainer: HTMLElement,
  styles: Map<HTMLElement, string>,
): void {
  // Calculate and set fixed height for README editor
  const editorHeight = calculateEditorHeight(wrapper);

  // Apply height and overflow to the scroll container
  saveOriginalStyle(readmeScrollContainer, styles);
  setStyle(readmeScrollContainer, "height", `${editorHeight}px`);
  setStyle(readmeScrollContainer, "overflow", "auto");

  // Show header without grid styles
  if (header) {
    saveOriginalStyle(header, styles);
    setStyle(header, "display", "flex");
  }

  // README: Apply grid to CodeMirror editor to split it into 2 columns
  saveOriginalStyle(writeArea, styles);
  setStyle(writeArea, "display", "block");

  const codemirror = writeArea.querySelector<HTMLElement>(SELECTORS.CODEMIRROR);
  if (codemirror) {
    saveOriginalStyle(codemirror, styles);
    // Apply grid to CodeMirror to create 2 equal columns (50% 50%)
    setStyle(codemirror, "display", "grid");
    setStyle(codemirror, "grid-template-columns", LAYOUT.SPLIT_COLUMNS);
    setStyle(codemirror, "height", "100%");

    // Move preview into CodeMirror editor right after the editor div
    saveOriginalStyle(previewArea, styles);

    // Find the editor div (has aria-labelledby="codemirror-label")
    const editorDiv = codemirror.querySelector<HTMLElement>(
      SELECTORS.CM_EDITOR_DIV,
    );

    if (editorDiv && previewArea.parentElement !== codemirror) {
      // Insert preview right after the editor div (as 2nd child)
      if (editorDiv.nextSibling) {
        codemirror.insertBefore(previewArea, editorDiv.nextSibling);
      } else {
        codemirror.appendChild(previewArea);
      }
    }

    setStyle(previewArea, "display", "block");
    setStyle(previewArea, "overflow-y", "auto");
    setStyle(previewArea, "height", "100%");
  }
}

/**
 * Setup resize listener for README editor.
 */
export function setupReadmeResizeListener(
  wrapper: HTMLElement,
  readmeScrollContainer: HTMLElement,
): () => void {
  const handleResize = () => {
    const editorHeight = calculateEditorHeight(wrapper);
    setStyle(readmeScrollContainer, "height", `${editorHeight}px`);
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}
