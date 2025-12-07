import { SELECTORS } from "../constants/selectors";
import { TIMINGS } from "../constants/timings";
import {
  saveOriginalStyle,
  setStyle,
  calculateTextareaHeightOldUI,
  clickPreviewTab,
  resetPreviewBodyMinHeight,
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

  // Grid layout, display values, and positioning are handled by CSS via data-split-view-type="old-pr"
  saveOriginalStyle(gridContainer, styles);

  // Header spans both columns (100% width)
  if (header) {
    saveOriginalStyle(header, styles);
  }

  // Special handling for PR description editing
  if (isPRDescriptionEditing) {
    // Toolbar visibility is handled by CSS
    const toolbar = gridContainer.querySelector<HTMLElement>(
      SELECTORS.TOOLBAR_OLD_PR,
    );
    if (toolbar) {
      saveOriginalStyle(toolbar, styles);
    }

    // Find the actual write bucket inside writeArea
    const writeBucket = writeArea.querySelector<HTMLElement>(
      SELECTORS.WRITE_BUCKET,
    );

    if (writeBucket) {
      // Force show writeArea (CSS can't override hidden attribute or inline display:none)
      saveOriginalStyle(writeArea, styles);
      writeArea.removeAttribute("hidden");
      setStyle(writeArea, "display", "contents"); // Children become direct grid items

      // Force show write bucket (CSS positioning won't work if element is hidden)
      saveOriginalStyle(writeBucket, styles);
      setStyle(writeBucket, "display", "block");

      // Force show preview (CSS positioning won't work if element is hidden)
      saveOriginalStyle(previewArea, styles);
      setStyle(previewArea, "display", "block");

      // Set initial preview height to match textarea (DYNAMIC - must stay in JS)
      const textarea = writeBucket.querySelector<HTMLTextAreaElement>(
        SELECTORS.TEXTAREA,
      );
      if (textarea) {
        const textareaHeight = calculateTextareaHeightOldUI(textarea);
        setStyle(previewArea, "height", `${textareaHeight}px`);
      }

      // Simulate click on Preview tab to refresh content
      clickPreviewTab(wrapper);

      // Reset min-height on preview body AFTER preview refreshes (when element appears)
      setTimeout(() => {
        resetPreviewBodyMinHeight(previewArea, styles);
      }, TIMINGS.PREVIEW_BODY_MIN_HEIGHT_RESET_DELAY);

      // Setup auto-refresh: watch textarea changes
      if (textarea) {
        let refreshTimeout: ReturnType<typeof setTimeout>;

        const handleTextareaChange = () => {
          // Update preview height to match textarea dynamically (DYNAMIC - must stay in JS)
          const textareaHeight = calculateTextareaHeightOldUI(textarea);
          setStyle(previewArea, "height", `${textareaHeight}px`);

          // Debounce: refresh preview 500ms after user stops typing
          clearTimeout(refreshTimeout);
          refreshTimeout = setTimeout(() => {
            clickPreviewTab(wrapper);

            // Reset min-height on preview body after refresh
            setTimeout(() => {
              resetPreviewBodyMinHeight(previewArea, styles);
            }, TIMINGS.PREVIEW_BODY_MIN_HEIGHT_RESET_DELAY);
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
  // Force show writeArea (CSS can't override hidden attribute)
  saveOriginalStyle(writeArea, styles);
  writeArea.removeAttribute("hidden");
  setStyle(writeArea, "display", "block");

  // Force show preview (CSS positioning won't work if element is hidden)
  saveOriginalStyle(previewArea, styles);
  setStyle(previewArea, "display", "block");

  // Set initial preview height to match textarea (DYNAMIC - must stay in JS)
  const textarea = writeArea.querySelector<HTMLTextAreaElement>(
    SELECTORS.TEXTAREA,
  );
  if (textarea) {
    const textareaHeight = calculateTextareaHeightOldUI(textarea);
    setStyle(previewArea, "height", `${textareaHeight}px`);
  }

  // Simulate click on Preview tab to refresh content
  clickPreviewTab(wrapper);

  // Reset min-height on preview body AFTER preview refreshes (when element appears)
  setTimeout(() => {
    resetPreviewBodyMinHeight(previewArea, styles);
  }, TIMINGS.PREVIEW_BODY_MIN_HEIGHT_RESET_DELAY);

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

        // Reset min-height on preview body after refresh
        setTimeout(() => {
          resetPreviewBodyMinHeight(previewArea, styles);
        }, TIMINGS.PREVIEW_BODY_MIN_HEIGHT_RESET_DELAY);
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
