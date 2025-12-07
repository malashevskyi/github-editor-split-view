import { findHeader } from "./editorSelectors";
import { SELECTORS } from "../constants/selectors";
import { LAYOUT } from "../constants/layout";

/**
 * Calculate textarea height for OLD PR UI.
 *
 * WHY: OLD PR UI doesn't use max-height, textarea grows dynamically.
 * We need to use actual rendered height (offsetHeight) to sync with preview.
 */
export function calculateTextareaHeightOldUI(
  textarea: HTMLTextAreaElement,
): number {
  // Use actual offsetHeight (current rendered height)
  const actualHeight = textarea.offsetHeight;
  if (actualHeight > 0) {
    return actualHeight;
  }

  // Fallback: try scrollHeight
  if (textarea.scrollHeight > 0) {
    return textarea.scrollHeight;
  }

  // Default fallback
  return LAYOUT.DEFAULT_TEXTAREA_HEIGHT;
}

/**
 * Simulate click on Preview tab to refresh preview content.
 *
 * WHY: When split mode is activated, the preview content may be stale.
 * GitHub only updates preview when the Preview tab is clicked.
 * We simulate a click to trigger GitHub's preview refresh logic.
 *
 * IMPORTANT: Preserve focus on the textarea after clicking Preview.
 * Without this, user loses focus while typing and has to click back.
 */
export function clickPreviewTab(wrapper: HTMLElement): void {
  // Save currently focused element
  const activeElement = document.activeElement as HTMLElement;

  // Try to find Preview tab button
  const header = findHeader(wrapper);
  if (!header) return;

  // Check for regular tabs (issues/PR/comments)
  let previewTab = header.querySelector<HTMLButtonElement>(
    SELECTORS.PREVIEW_TAB_BUTTON,
  );

  // If not found, try old PR UI tabs
  if (!previewTab) {
    const tabNav = header.querySelector(SELECTORS.TAB_CONTAINER_OLD_PR);
    if (tabNav) {
      const tabs = tabNav.querySelectorAll<HTMLButtonElement>(
        SELECTORS.TAB_BUTTON_INNER,
      );
      // Preview is usually the 2nd tab
      previewTab = tabs[1];
    }
  }

  // If still not found, try SegmentedControl (README editor)
  if (!previewTab) {
    const segmentedItems = header.querySelectorAll<HTMLElement>(
      SELECTORS.SEGMENTED_CONTROL_ITEM,
    );
    segmentedItems.forEach((item, index) => {
      const button = item.querySelector<HTMLButtonElement>(
        SELECTORS.TAB_BUTTON_INNER,
      );
      const textElement = button?.querySelector(SELECTORS.TAB_TEXT);
      const text =
        textElement?.getAttribute("data-text") || textElement?.textContent;

      if (text === "Preview" || index === 1) {
        previewTab = button;
      }
    });
  }

  // Simulate click if found
  if (previewTab) {
    previewTab.click();

    // Restore focus back to the original element (textarea)
    // Use setTimeout to ensure GitHub's handlers run first
    setTimeout(() => {
      if (activeElement && activeElement !== document.body) {
        activeElement.focus();
      }
    }, 0);
  }
}

/**
 * Calculate available height for editor based on viewport and offset from top.
 *
 * WHY: Without fixed height, the editor scrolls the entire page, making
 * toolbar buttons scroll out of view. We need editor to scroll internally.
 */
export function calculateEditorHeight(editorWrapper: HTMLElement): number {
  const rect = editorWrapper.getBoundingClientRect();
  const offsetFromTop = rect.top + window.scrollY;
  const viewportHeight = window.innerHeight;
  const availableHeight = viewportHeight - offsetFromTop - 20; // 20px bottom padding
  return Math.max(availableHeight, LAYOUT.MIN_EDITOR_HEIGHT);
}

/**
 * Save original style attribute for an element.
 */
export function saveOriginalStyle(
  element: HTMLElement,
  styles: Map<HTMLElement, string>,
): void {
  if (!styles.has(element)) {
    styles.set(element, element.getAttribute("style") || "");
  }
}

/**
 * Set CSS property with !important flag.
 */
export function setStyle(
  element: HTMLElement,
  property: string,
  value: string,
): void {
  element.style.setProperty(property, value, "important");
}

/**
 * Hide all children except specified elements.
 */
export function hideOtherChildren(
  wrapper: HTMLElement,
  keepVisible: (HTMLElement | null)[],
  styles: Map<HTMLElement, string>,
): void {
  const children = Array.from(wrapper.children) as HTMLElement[];
  children.forEach((child) => {
    if (!keepVisible.includes(child)) {
      saveOriginalStyle(child, styles);
      setStyle(child, "display", "none");
    }
  });
}

/**
 * Reset min-height on preview body element.
 * Called after preview refreshes to override GitHub's dynamic min-height.
 */
export function resetPreviewBodyMinHeight(
  previewArea: HTMLElement,
  styles: Map<HTMLElement, string>,
): void {
  const previewBody =
    previewArea.querySelector<HTMLElement>(".js-preview-body");
  if (previewBody) {
    saveOriginalStyle(previewBody, styles);
    setStyle(previewBody, "min-height", "0");
  }
}
