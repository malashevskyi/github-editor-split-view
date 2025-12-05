import { useEffect, useRef } from "react";
import {
  findHeader,
  findWriteArea,
  findPreviewArea,
} from "../utils/editorSelectors";
import { SELECTORS } from "../constants/selectors";

/**
 * Applies split-view layout using CSS Grid when split mode is active.
 *
 * WHY: By default, GitHub shows EITHER Write OR Preview (tab-based UI).
 * We want to show BOTH side-by-side for real-time preview.
 *
 * PROBLEM: GitHub's CSS hides the inactive tab's content (display:none).
 * We need to:
 * 1. Change parent container to CSS Grid (2 columns)
 * 2. Force both Write and Preview to display:block
 * 3. Hide everything else (GitHub's extra UI elements)
 * 4. Restore original styles when exiting split mode
 *
 * WHY SAVE ORIGINAL STYLES: GitHub sets inline styles dynamically.
 * If we just remove our styles, GitHub's UI breaks. We must restore
 * the exact original style attribute for clean reversibility.
 *
 * This hook is the core of the split-view functionality - it's what
 * actually makes write and preview appear side-by-side.
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
      styles.set(editorWrapper, editorWrapper.getAttribute("style") || "");

      // Apply CSS Grid: 2 equal columns for write/preview
      editorWrapper.style.display = "grid";
      editorWrapper.style.gridTemplateColumns = "1fr 1fr";

      const children = Array.from(editorWrapper.children) as HTMLElement[];

      // Hide all children by default (we'll selectively show what we need)
      children.forEach((child) => {
        styles.set(child, child.getAttribute("style") || "");
        child.style.setProperty("display", "none", "important");
      });

      const header = findHeader(editorWrapper);
      const writeArea = findWriteArea(editorWrapper);
      const previewArea = findPreviewArea(editorWrapper);

      // Header spans both columns (tabs + our Split button)
      if (header) {
        header.style.setProperty("display", "flex", "important");
        header.style.gridColumn = "1 / 3";
      } else {
        console.warn("[useSplitMode] No header found!");
      }

      // Write area (left column)
      if (writeArea) {
        writeArea.style.setProperty("display", "block", "important");

        // For issues/PR/comments - show textarea wrapper span
        const span = writeArea.querySelector<HTMLElement>(
          SELECTORS.TEXTAREA_SPAN,
        );
        if (span) {
          styles.set(span, span.getAttribute("style") || "");
          span.style.setProperty("display", "block", "important");
        }

        // For README editor - ensure CodeMirror is visible
        const codemirror = writeArea.querySelector<HTMLElement>(
          SELECTORS.CODEMIRROR,
        );
        if (codemirror) {
          codemirror.style.setProperty("display", "block", "important");
        }
      } else {
        console.warn("[useSplitMode] No writeArea found!");
      }

      // Preview area (right column)
      if (previewArea) {
        previewArea.style.setProperty("display", "block", "important");
      } else {
        console.warn("[useSplitMode] No previewArea found!");
      }
    } else {
      // Exit split mode: restore all original styles
      for (const [element, style] of originalStyles.current.entries()) {
        element.setAttribute("style", style);
      }
      originalStyles.current.clear();
    }
  }, [isSplit, editorWrapper]);
}
