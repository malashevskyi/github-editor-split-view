import { useEffect, useRef } from "react";
import {
  findHeader,
  findWriteArea,
  findPreviewArea,
  findReadmeScrollContainer,
} from "../utils/editorSelectors";
import { SELECTORS } from "../constants/selectors";
import {
  saveOriginalStyle,
  hideOtherChildren,
} from "../utils/splitModeHelpers";
import {
  applyReadmeSplitMode,
  setupReadmeResizeListener,
} from "../utils/splitModeReadme";
import { applyOldPRSplitMode } from "../utils/splitModeOldPR";
import { applyNewUISplitMode } from "../utils/splitModeNewUI";

/**
 * Applies split-view layout using CSS Grid/Flexbox when split mode is active.
 *
 * WHY: By default, GitHub shows EITHER Write OR Preview (tab-based UI).
 * We want to show BOTH side-by-side for real-time preview.
 *
 * This hook handles three different GitHub UI types:
 * - README editor (CodeMirror with nested scroll)
 * - Issues/Comments (NEW UI with CSS modules)
 * - Pull Request comments (OLD UI with tabnav)
 *
 * Each UI type requires different CSS Grid/Flexbox approach.
 */
export function useSplitMode(
  editorWrapper: HTMLElement | null,
  isSplit: boolean,
) {
  // Store original style attributes to restore later
  const originalStyles = useRef(new Map<HTMLElement, string>());

  useEffect(() => {
    if (!editorWrapper) return;

    if (isSplit) {
      const styles = originalStyles.current;
      saveOriginalStyle(editorWrapper, styles);

      const header = findHeader(editorWrapper);
      const writeArea = findWriteArea(editorWrapper);
      const previewArea = findPreviewArea(editorWrapper);
      const readmeScrollContainer = findReadmeScrollContainer(editorWrapper);

      if (!writeArea || !previewArea) {
        console.warn("[useSplitMode] Missing writeArea or previewArea");
        return;
      }

      // Detect UI type and apply appropriate styles
      const isReadmeEditor = !!readmeScrollContainer;
      const isOldPRUI =
        editorWrapper.classList.contains("js-previewable-comment-form") ||
        editorWrapper.classList.contains("CommentBox");

      // Hide all children except header, writeArea, and previewArea
      // EXCEPT for OLD PR UI - it manages visibility internally
      if (!isOldPRUI) {
        hideOtherChildren(
          editorWrapper,
          [header, writeArea, previewArea],
          styles,
        );
      }

      let cleanup: (() => void) | undefined;

      if (isReadmeEditor && readmeScrollContainer) {
        // README: Grid on CodeMirror, flex layout
        applyReadmeSplitMode(
          editorWrapper,
          writeArea,
          previewArea,
          header,
          readmeScrollContainer,
          styles,
        );
        cleanup = setupReadmeResizeListener(
          editorWrapper,
          readmeScrollContainer,
        );
      } else if (isOldPRUI) {
        // OLD PR UI: Grid on wrapper (tab-container)
        cleanup = applyOldPRSplitMode(
          editorWrapper,
          writeArea,
          previewArea,
          header,
          styles,
        );
      } else {
        // NEW UI (Issues/Comments): Grid on writeArea
        applyNewUISplitMode(
          editorWrapper,
          writeArea,
          previewArea,
          header,
          styles,
        );
      }

      // Hide "Show Diff" button in README split mode
      if (isReadmeEditor) {
        const showDiffLabel = editorWrapper.querySelector<HTMLElement>(
          SELECTORS.SHOW_DIFF_BUTTON,
        );
        if (showDiffLabel) {
          const container = showDiffLabel.closest<HTMLElement>(
            SELECTORS.SHOW_DIFF_CONTAINER,
          );
          if (container) {
            saveOriginalStyle(container, styles);
            container.style.setProperty("opacity", "0", "important");
            container.style.setProperty("pointer-events", "none", "important");
          }
        }
      }

      return cleanup;
    } else {
      // Exit split mode: restore all original styles
      for (const [element, style] of originalStyles.current.entries()) {
        if (style) {
          element.setAttribute("style", style);
        } else {
          element.removeAttribute("style");
        }
      }
      originalStyles.current.clear();

      // Move previewArea back to wrapper if it was moved
      const writeArea = findWriteArea(editorWrapper);
      const previewArea = findPreviewArea(editorWrapper);

      if (writeArea && previewArea && writeArea.contains(previewArea)) {
        if (writeArea.nextSibling) {
          editorWrapper.insertBefore(previewArea, writeArea.nextSibling);
        } else {
          editorWrapper.appendChild(previewArea);
        }
      }
    }
  }, [isSplit, editorWrapper]);
}
