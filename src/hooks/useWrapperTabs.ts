import { useEffect, useState } from "react";
import { findHeader } from "../utils/editorSelectors";
import { SELECTORS } from "../constants/selectors";

/**
 * Detects which tab (Write/Preview) is currently active in GitHub's editor.
 *
 * WHY: Our Toolbar should only appear when Write tab is active because:
 * - Formatting buttons only make sense in write mode
 * - Preview tab shows read-only rendered markdown
 * - Showing toolbar in preview would confuse users
 *
 * PROBLEM: GitHub uses different tab implementations:
 * - Issues/Comments: Regular <button role="tab"> with .selected class
 * - README: Custom SegmentedControl with data-selected attribute
 *
 * We need to detect both, and watch for changes (user clicking tabs).
 *
 * SOLUTION: MutationObserver watches for attribute changes on tab elements.
 * When user clicks Write → Preview, attributes change, we detect it,
 * and hide our toolbar. When they click back to Write, we show it again.
 *
 * This ensures our extension doesn't interfere with GitHub's UX.
 */
export const useWrapperTabs = (wrapper: HTMLElement) => {
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  useEffect(() => {
    const header = findHeader(wrapper);
    if (!header) return;

    const checkTab = () => {
      // Check for regular tabs (issues/PR/comments)
      let previewTab = header!.querySelector<HTMLButtonElement>(
        SELECTORS.TAB_BUTTON,
      );

      // Check if Preview tab has "selected" class or aria-selected="true"
      let isActive =
        !!previewTab &&
        (previewTab.classList.contains("selected") ||
          previewTab.getAttribute("aria-selected") === "true");

      // If regular tabs not found, check SegmentedControl (README editor)
      if (!previewTab) {
        const segmentedControlItems = header!.querySelectorAll<HTMLElement>(
          SELECTORS.SEGMENTED_CONTROL_ITEM,
        );

        // Find the Preview tab (usually second item, or labeled "Preview")
        segmentedControlItems.forEach((item, index) => {
          const button = item.querySelector(SELECTORS.TAB_BUTTON_INNER);
          const textElement = button?.querySelector(SELECTORS.TAB_TEXT);
          const text =
            textElement?.getAttribute("data-text") || textElement?.textContent;

          if (text === "Preview" || index === 1) {
            // SegmentedControl uses data-selected attribute
            isActive =
              item.hasAttribute("data-selected") ||
              button?.getAttribute("aria-current") === "true";
          }
        });
      }

      setIsPreviewActive(isActive);
    };

    // Check immediately on mount
    checkTab();

    // Watch for tab changes (user clicking between Write/Preview)
    const tabObserver = new MutationObserver(checkTab);

    // Observe regular tabs (issues/PR/comments)
    const tabList = header.querySelector(SELECTORS.TAB_LIST);
    if (tabList) {
      tabObserver.observe(tabList, { attributes: true, subtree: true });
    }

    // Observe SegmentedControl (README editor)
    const segmentedControl = header.querySelector(SELECTORS.SEGMENTED_CONTROL);
    if (segmentedControl) {
      tabObserver.observe(segmentedControl, {
        attributes: true,
        subtree: true,
      });
    }

    return () => tabObserver.disconnect();
  }, [wrapper]);

  return { isPreviewActive };
};
