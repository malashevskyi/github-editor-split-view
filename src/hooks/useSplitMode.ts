import { useEffect, useRef } from "react";
import {
  findHeader,
  findWriteArea,
  findPreviewArea,
  findReadmeScrollContainer,
} from "../utils/editorSelectors";
import { saveOriginalStyle } from "../utils/splitModeHelpers";
import {
  applyReadmeSplitMode,
  setupReadmeResizeListener,
} from "../utils/splitModeReadme";
import { applyOldPRSplitMode } from "../utils/splitModeOldPR";
import { applyNewUISplitMode } from "../utils/splitModeNewUI";

export type ViewType = "readme" | "old-pr" | "new-ui";

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
  viewType: ViewType,
) {
  // Store original style attributes to restore later
  const originalStyles = useRef(new Map<HTMLElement, string>());
  const isReadmeEditor = viewType === "readme";
  const isOldPRUI = viewType === "old-pr";
  const isNewUI = viewType === "new-ui";

  useEffect(() => {
    if (!editorWrapper) return;

    const writeArea = findWriteArea(editorWrapper);
    const previewArea = findPreviewArea(editorWrapper);

    if (isSplit) {
      const styles = originalStyles.current;
      saveOriginalStyle(editorWrapper, styles);

      if (!writeArea || !previewArea) {
        console.warn("[useSplitMode] Missing writeArea or previewArea");
        return;
      }

      const readmeScrollContainer = isReadmeEditor
        ? findReadmeScrollContainer(editorWrapper)
        : null;

      // Add data attribute for UI type to enable CSS-based styling
      if (isReadmeEditor) {
        editorWrapper.setAttribute("data-split-view-type", "readme");
      } else if (isOldPRUI) {
        editorWrapper.setAttribute("data-split-view-type", "old-pr");
      } else if (isNewUI) {
        editorWrapper.setAttribute("data-split-view-type", "new-ui");
      }

      let cleanup: (() => void) | undefined;

      const header = findHeader(editorWrapper);

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
      } else if (isNewUI) {
        // NEW UI (Issues/Comments): Grid on writeArea
        applyNewUISplitMode(writeArea, previewArea, header, styles);
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

      // Remove data attribute for UI type
      editorWrapper.removeAttribute("data-split-view-type");

      // Move previewArea back to wrapper if it was moved
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
