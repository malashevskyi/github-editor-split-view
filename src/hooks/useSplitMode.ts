import { useEffect, useRef } from "react";
import {
  findHeader,
  findWriteArea,
  findPreviewArea,
  findReadmeScrollContainer,
} from "../utils/editorSelectors";
import { SELECTORS } from "../constants/selectors";

/**
 * Applies split-view layout using CSS Grid/Flexbox when split mode is active.
 *
 * WHY: By default, GitHub shows EITHER Write OR Preview (tab-based UI).
 * We want to show BOTH side-by-side for real-time preview.
 *
 * PROBLEM: GitHub's CSS hides the inactive tab's content (display:none).
 * We need to:
 * 1. Force both Write and Preview to display
 * 2. Position them side-by-side (50% each)
 * 3. Handle different DOM structures for Issues vs README
 * 4. Restore original styles when exiting split mode
 *
 * TWO DIFFERENT APPROACHES:
 *
 * A) ISSUES/COMMENTS: Grid on outer container
 *    - Outer wrapper gets display:grid with 2 columns
 *    - Write/preview areas fill grid cells with height:100%
 *    - Each area scrolls independently
 *
 * B) README: Flexbox on inner scrollable container
 *    - Outer: .react-code-view-edit (full height, no scroll)
 *    - Inner: file-attachment (actual editor with scroll)
 *    - Apply display:flex to INNER container
 *    - Move preview into inner container alongside write area
 *    - Both become flex children (flex:1 = 50% each)
 *    - They share the SAME scrollable space
 *
 * WHY DIFFERENT APPROACHES:
 * README has nested structure where outer container is full-height
 * but inner container has the actual scroll. Applying grid to outer
 * would make preview overflow beyond container borders. By using flex
 * on the inner scrollable container, both areas respect scroll bounds.
 *
 * WHY SAVE ORIGINAL STYLES: GitHub sets inline styles dynamically.
 * If we just remove our styles, GitHub's UI breaks. We must restore
 * the exact original style attribute for clean reversibility.
 */

/**
 * Calculate textarea height for Issues/Comments editor.
 *
 * WHY: GitHub uses dynamic max-height (like 35lh) for textarea. We need to
 * programmatically determine the actual height and apply it to both textarea
 * and preview to keep them synchronized. Without this, preview renders at full
 * height causing empty space below textarea.
 */
function calculateTextareaHeight(textarea: HTMLTextAreaElement): number {
  const computedStyle = window.getComputedStyle(textarea);
  const maxHeight = computedStyle.maxHeight;

  // Parse max-height value
  if (maxHeight && maxHeight !== "none") {
    const maxHeightPx = parseFloat(maxHeight);
    if (!isNaN(maxHeightPx)) {
      return maxHeightPx;
    }
  }

  // Fallback: use scrollHeight or default
  return textarea.scrollHeight || 400;
}

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

      const header = findHeader(editorWrapper);
      const writeArea = findWriteArea(editorWrapper);
      const previewArea = findPreviewArea(editorWrapper);
      const readmeScrollContainer = findReadmeScrollContainer(editorWrapper);

      // Hide all children EXCEPT writeArea (we'll selectively show what we need)
      const children = Array.from(editorWrapper.children) as HTMLElement[];
      children.forEach((child) => {
        if (child !== writeArea && child !== header) {
          styles.set(child, child.getAttribute("style") || "");
          child.style.setProperty("display", "none", "important");
        }
      });

      // Detect if this is README editor (has inner scroll container)
      const isReadmeEditor = !!readmeScrollContainer;

      // Show header (don't apply grid styles for README)
      if (header) {
        styles.set(header, header.getAttribute("style") || "");
        header.style.setProperty("display", "flex", "important");
        // Only apply grid-column for Issues/Comments (not for README)
        if (!isReadmeEditor) {
          header.style.gridColumn = "1 / 3";
        }
      } else {
        console.warn("[useSplitMode] No header found!");
      }

      // Different handling for README vs Issues
      if (isReadmeEditor && readmeScrollContainer) {
        // Calculate and set fixed height for README editor
        const editorHeight = calculateEditorHeight(editorWrapper);

        // Apply height and overflow to the scroll container
        styles.set(
          readmeScrollContainer,
          readmeScrollContainer.getAttribute("style") || "",
        );
        readmeScrollContainer.style.setProperty(
          "height",
          `${editorHeight}px`,
          "important",
        );
        readmeScrollContainer.style.setProperty(
          "overflow",
          "auto",
          "important",
        );

        // README: Apply grid to CodeMirror editor to split it into 2 columns
        if (writeArea) {
          writeArea.style.setProperty("display", "block", "important");

          const codemirror = writeArea.querySelector<HTMLElement>(
            SELECTORS.CODEMIRROR,
          );
          if (codemirror) {
            styles.set(codemirror, codemirror.getAttribute("style") || "");
            // Apply grid to CodeMirror to create 2 equal columns (50% 50%)
            codemirror.style.setProperty("display", "grid", "important");
            codemirror.style.setProperty(
              "grid-template-columns",
              "50% 50%",
              "important",
            );
            codemirror.style.setProperty("height", "100%", "important");

            // Move preview into CodeMirror editor right after the editor div
            if (previewArea) {
              styles.set(previewArea, previewArea.getAttribute("style") || "");

              // Find the editor div (has aria-labelledby="codemirror-label")
              const editorDiv = codemirror.querySelector<HTMLElement>(
                'div[aria-labelledby="codemirror-label"]',
              );

              if (editorDiv && previewArea.parentElement !== codemirror) {
                // Insert preview right after the editor div (as 2nd child)
                if (editorDiv.nextSibling) {
                  codemirror.insertBefore(previewArea, editorDiv.nextSibling);
                } else {
                  codemirror.appendChild(previewArea);
                }
              }

              previewArea.style.setProperty("display", "block", "important");
              previewArea.style.setProperty("overflow-y", "auto", "important");
              previewArea.style.setProperty("height", "100%", "important");
            }
          }
        }
      } else {
        // Issues/Comments: Apply grid to writeArea container
        // Remove grid from wrapper (was causing 50% width issue)
        editorWrapper.style.removeProperty("display");
        editorWrapper.style.removeProperty("grid-template-columns");
        editorWrapper.style.removeProperty("grid-template-rows");

        if (writeArea) {
          styles.set(writeArea, writeArea.getAttribute("style") || "");

          // Apply grid to writeArea to split editor and preview
          writeArea.style.setProperty("display", "grid", "important");
          writeArea.style.setProperty(
            "grid-template-columns",
            "50% 50%",
            "important",
          );
          writeArea.style.setProperty("height", "100%", "important");

          const span = writeArea.querySelector<HTMLElement>(
            SELECTORS.TEXTAREA_SPAN,
          );
          const textarea = writeArea.querySelector<HTMLTextAreaElement>(
            SELECTORS.TEXTAREA,
          );

          if (span) {
            styles.set(span, span.getAttribute("style") || "");
            span.style.setProperty("display", "block", "important");
          }

          // Calculate and set textarea height
          if (textarea) {
            styles.set(textarea, textarea.getAttribute("style") || "");
            const textareaHeight = calculateTextareaHeight(textarea);
            textarea.style.setProperty(
              "height",
              `${textareaHeight}px`,
              "important",
            );
            textarea.style.setProperty(
              "max-height",
              `${textareaHeight}px`,
              "important",
            );
            textarea.style.removeProperty("box-sizing"); // Remove box-sizing: content-box that breaks scroll
          }

          // Move preview into writeArea (as 2nd column)
          if (previewArea && span) {
            styles.set(previewArea, previewArea.getAttribute("style") || "");

            if (previewArea.parentElement !== writeArea) {
              // Insert preview right after the span
              if (span.nextSibling) {
                writeArea.insertBefore(previewArea, span.nextSibling);
              } else {
                writeArea.appendChild(previewArea);
              }
            }

            previewArea.style.setProperty("display", "block", "important");
            previewArea.style.setProperty("overflow-y", "auto", "important");

            // Set preview height to match textarea
            if (textarea) {
              const textareaHeight = calculateTextareaHeight(textarea);
              previewArea.style.setProperty(
                "height",
                `${textareaHeight}px`,
                "important",
              );
            }
          }
        }
      }

      if (!writeArea) {
        console.warn("[useSplitMode] No writeArea found!");
      }
      if (!previewArea) {
        console.warn("[useSplitMode] No previewArea found!");
      }

      /**
       * Hide "Show Diff" button in split mode.
       *
       * WHY: The "Show Diff" button doesn't work correctly when split mode is active
       * because it expects preview to be in a specific location. Rather than
       * implementing complex diff logic for split view, we simply hide the button.
       */
      const showDiffLabel = editorWrapper.querySelector<HTMLElement>(
        SELECTORS.SHOW_DIFF_BUTTON,
      );
      if (showDiffLabel) {
        const container = showDiffLabel.closest<HTMLElement>(
          SELECTORS.SHOW_DIFF_CONTAINER,
        );
        if (container) {
          styles.set(container, container.getAttribute("style") || "");
          container.style.setProperty("opacity", "0", "important");
          container.style.setProperty("pointer-events", "none", "important");
        }
      }

      /**
       * Setup resize listener to update editor height dynamically.
       *
       * WHY: When user resizes window or changes page zoom, the available
       * viewport height changes. We need to recalculate and update the
       * fixed editor height to maintain proper internal scrolling.
       * Without this, editor might be too tall/short after resize.
       */
      const handleResize = () => {
        const readmeScrollContainer = findReadmeScrollContainer(editorWrapper);
        if (readmeScrollContainer) {
          const editorHeight = calculateEditorHeight(editorWrapper);
          readmeScrollContainer.style.setProperty(
            "height",
            `${editorHeight}px`,
            "important",
          );
        }

        // Update textarea and preview heights for Issues/Comments
        const writeArea = findWriteArea(editorWrapper);
        if (writeArea) {
          const textarea = writeArea.querySelector<HTMLTextAreaElement>(
            SELECTORS.TEXTAREA,
          );
          const previewArea = findPreviewArea(editorWrapper);

          if (textarea) {
            const textareaHeight = calculateTextareaHeight(textarea);
            textarea.style.setProperty(
              "height",
              `${textareaHeight}px`,
              "important",
            );
            textarea.style.setProperty(
              "max-height",
              `${textareaHeight}px`,
              "important",
            );

            if (previewArea) {
              previewArea.style.setProperty(
                "height",
                `${textareaHeight}px`,
                "important",
              );
            }
          }
        }
      };

      window.addEventListener("resize", handleResize);

      // Cleanup function
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    } else {
      // Exit split mode: restore all original styles
      for (const [element, style] of originalStyles.current.entries()) {
        element.setAttribute("style", style);
      }
      originalStyles.current.clear();
    }
  }, [isSplit, editorWrapper]);
}

/**
 * Calculate available height for editor based on viewport and offset from top.
 *
 * WHY: Without fixed height, the editor scrolls the entire page, making
 * toolbar buttons scroll out of view. We need editor to scroll internally.
 */
function calculateEditorHeight(editorWrapper: HTMLElement): number {
  const rect = editorWrapper.getBoundingClientRect();
  const offsetFromTop = rect.top + window.scrollY;
  const viewportHeight = window.innerHeight;
  const availableHeight = viewportHeight - offsetFromTop - 20; // 20px bottom padding
  return Math.max(availableHeight, 300); // Minimum 300px
}
