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
 * Apply split mode styles for OLD PR UI (Pull Request description editing and comments).
 *
 * WHY: OLD UI has TWO different wrapper structures:
 * 1. PR description editing: .js-previewable-comment-form is wrapper, .Box.CommentBox is nested inside
 * 2. PR comments: .CommentBox is the wrapper itself
 *
 * We apply grid to the correct element (the one that directly contains header, writeArea, previewArea).
 */
export function applyOldPRSplitMode(
  wrapper: HTMLElement,
  writeArea: HTMLElement,
  previewArea: HTMLElement,
  header: HTMLElement | null,
  styles: Map<HTMLElement, string>,
): (() => void) | undefined {
  // Determine the grid container:
  // - For PR description editing: wrapper is DIV with "Box CommentBox", has .preview-content
  // - For PR comments: wrapper is TAB-CONTAINER with "js-previewable-comment-form", has .js-preview-panel
  let gridContainer: HTMLElement;
  let isPRDescriptionEditing = false;

  // Strategy: If wrapper has CommentBox class, check for unique child elements to differentiate
  if (wrapper.classList.contains("CommentBox")) {
    // Check if it's PR description editing by looking for .preview-content (unique to PR description)
    const hasPreviewContent = !!wrapper.querySelector(
      SELECTORS.PR_DESCRIPTION_PREVIEW_CONTENT,
    );

    if (hasPreviewContent) {
      // PR description editing: DIV wrapper with .preview-content child
      gridContainer = wrapper;
      isPRDescriptionEditing = true;
    } else {
      // PR comment or other OLD PR UI: has .js-preview-panel or other structure
      gridContainer = wrapper;
      isPRDescriptionEditing = false;
    }
  } else {
    // Fallback: no CommentBox class (shouldn't happen for OLD PR UI)
    gridContainer = wrapper;
    isPRDescriptionEditing = false;
  }

  // Old PR UI: Apply grid to the grid container (not necessarily the wrapper)
  saveOriginalStyle(gridContainer, styles);
  setStyle(gridContainer, "display", "grid");
  setStyle(gridContainer, "grid-template-columns", LAYOUT.SPLIT_COLUMNS);
  setStyle(gridContainer, "grid-template-rows", "auto 1fr");

  // Header spans both columns (100% width)
  if (header) {
    saveOriginalStyle(header, styles);
    setStyle(header, "display", "flex");
    header.style.gridColumn = "1 / 3";
    header.style.gridRow = "1";
  }

  // Special handling for PR description editing
  if (isPRDescriptionEditing) {
    // Hide the markdown toolbar (it's between header and writeArea)
    const toolbar = gridContainer.querySelector<HTMLElement>(
      SELECTORS.TOOLBAR_OLD_PR,
    );
    if (toolbar) {
      saveOriginalStyle(toolbar, styles);
      setStyle(toolbar, "display", "none");
    }

    // Find the actual write bucket inside writeArea
    const writeBucket = writeArea.querySelector<HTMLElement>(
      SELECTORS.WRITE_BUCKET,
    );

    if (writeBucket) {
      // Make writeArea (file-attachment) visible and remove it from grid flow
      saveOriginalStyle(writeArea, styles);
      writeArea.removeAttribute("hidden");
      setStyle(writeArea, "display", "contents"); // Children become direct grid items

      // Position write bucket in 1st column
      saveOriginalStyle(writeBucket, styles);
      setStyle(writeBucket, "display", "block");
      setStyle(writeBucket, "grid-column", "1");
      setStyle(writeBucket, "grid-row", "2");

      // Position preview in 2nd column
      saveOriginalStyle(previewArea, styles);
      setStyle(previewArea, "display", "block");
      setStyle(previewArea, "grid-column", "2");
      setStyle(previewArea, "grid-row", "2");
      setStyle(previewArea, "overflow-y", "auto");
      setStyle(previewArea, "max-height", LAYOUT.MAX_HEIGHT);

      // Set initial preview height to match textarea
      const textarea = writeBucket.querySelector<HTMLTextAreaElement>(
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
  }

  // === DEFAULT LOGIC (PR COMMENTS) ===
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
  const textarea = writeArea.querySelector<HTMLTextAreaElement>(
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
