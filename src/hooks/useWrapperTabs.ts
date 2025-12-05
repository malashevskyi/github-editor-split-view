import { useEffect, useState } from "react";
import { findHeader } from "../utils/editorSelectors";
import { SELECTORS } from "../constants/selectors";

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

      let isActive =
        !!previewTab &&
        (previewTab.classList.contains("selected") ||
          previewTab.getAttribute("aria-selected") === "true");

      // If not found, check for SegmentedControl tabs (README editor)
      if (!previewTab) {
        const segmentedControlItems = header!.querySelectorAll<HTMLElement>(
          SELECTORS.SEGMENTED_CONTROL_ITEM,
        );

        // Find the Preview tab (usually second item)
        segmentedControlItems.forEach((item, index) => {
          const button = item.querySelector(SELECTORS.TAB_BUTTON_INNER);
          const textElement = button?.querySelector(SELECTORS.TAB_TEXT);
          const text =
            textElement?.getAttribute("data-text") || textElement?.textContent;

          if (text === "Preview" || index === 1) {
            // if the item is selected it must have data-selected attribute
            isActive =
              item.hasAttribute("data-selected") ||
              button?.getAttribute("aria-current") === "true";
          }
        });
      }

      setIsPreviewActive(isActive);
    };

    checkTab();
    const tabObserver = new MutationObserver(checkTab);

    // Observe tablist for regular tabs
    const tabList = header.querySelector(SELECTORS.TAB_LIST);
    if (tabList) {
      tabObserver.observe(tabList, { attributes: true, subtree: true });
    }

    // Observe SegmentedControl for README editor
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
