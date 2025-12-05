import { useEffect, useRef } from "react";
import {
  findHeader,
  findWriteArea,
  findPreviewArea,
} from "../utils/editorSelectors";
import { SELECTORS } from "../constants/selectors";

export function useSplitMode(
  editorWrapper: HTMLElement | null,
  isSplit: boolean,
) {
  const originalStyles = useRef(new Map<HTMLElement, string>());

  useEffect(() => {
    if (!editorWrapper) return;

    if (isSplit) {
      const styles = originalStyles.current;
      styles.set(editorWrapper, editorWrapper.getAttribute("style") || "");

      editorWrapper.style.display = "grid";
      editorWrapper.style.gridTemplateColumns = "1fr 1fr";

      const children = Array.from(editorWrapper.children) as HTMLElement[];

      children.forEach((child) => {
        styles.set(child, child.getAttribute("style") || "");
        child.style.setProperty("display", "none", "important");
      });

      const header = findHeader(editorWrapper);
      const writeArea = findWriteArea(editorWrapper);
      const previewArea = findPreviewArea(editorWrapper);

      if (header) {
        header.style.setProperty("display", "flex", "important");
        header.style.gridColumn = "1 / 3";
      } else {
        console.warn("[useSplitMode] No header found!");
      }

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

      if (previewArea) {
        previewArea.style.setProperty("display", "block", "important");
      } else {
        console.warn("[useSplitMode] No previewArea found!");
      }
    } else {
      for (const [element, style] of originalStyles.current.entries()) {
        element.setAttribute("style", style);
      }
      originalStyles.current.clear();
    }
  }, [isSplit, editorWrapper]);
}
