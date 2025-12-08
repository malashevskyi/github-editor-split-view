import { useEffect, useState } from "react";
import { findHeader } from "../utils/editorSelectors";

/**
 * Detects which tab (Write/Preview) is currently active in GitHub's editor.
 *
 * WHY:
 * -  Our Toolbar should only appear when split mode is active and we are on the Preview tab.
 *    The toolbar on the Write/Edit tab is controlled by GitHub.
 * -  We need to cancel split mode on tab change to avoid Github race conditions.
 */
export const useWrapperTabs = (wrapper: HTMLElement) => {
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  useEffect(() => {
    const header = findHeader(wrapper);
    if (!header) return;

    const checkTab = () => {
      const activeTab = header.querySelector(
        '[aria-selected="true"], .selected, [data-selected]',
      );

      if (activeTab) {
        const text = activeTab.textContent?.trim().toLowerCase() || "";
        setIsPreviewActive(text.includes("preview"));
      }
    };

    checkTab();

    const observer = new MutationObserver(checkTab);
    observer.observe(header, {
      attributes: true,
      subtree: true,
      attributeFilter: ["class", "aria-selected", "data-selected"],
    });

    return () => observer.disconnect();
  }, [wrapper]);

  return { isPreviewActive };
};
