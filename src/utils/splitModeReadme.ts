import { SELECTORS } from "../constants/selectors";
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

  // Apply height to the scroll container (dynamic value, must be in JS)
  saveOriginalStyle(readmeScrollContainer, styles);
  setStyle(readmeScrollContainer, "height", `${editorHeight}px`);
  setStyle(readmeScrollContainer, "overflow", "auto");

  // Note: Grid layout, display values, and positioning are handled by CSS
  // via data-split-view-type="readme" attribute (see index.css)

  // Save original styles for restoration when exiting split mode
  if (header) {
    saveOriginalStyle(header, styles);
  }
  saveOriginalStyle(writeArea, styles);

  // Force show writeArea (GitHub adds .d-none class to react-code-view-edit)
  setStyle(writeArea, "display", "block");

  const codemirror = writeArea.querySelector<HTMLElement>(SELECTORS.CODEMIRROR);
  if (codemirror) {
    saveOriginalStyle(codemirror, styles);
    saveOriginalStyle(previewArea, styles);

    // Find the editor div (has aria-labelledby="codemirror-label")
    const editorDiv = codemirror.querySelector<HTMLElement>(
      SELECTORS.CM_EDITOR_DIV,
    );

    // Move preview into CodeMirror editor (CSS will position it in 2nd column)
    if (editorDiv && previewArea.parentElement !== codemirror) {
      // Insert preview right after the editor div (as 2nd child)
      if (editorDiv.nextSibling) {
        codemirror.insertBefore(previewArea, editorDiv.nextSibling);
      } else {
        codemirror.appendChild(previewArea);
      }
    }
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
