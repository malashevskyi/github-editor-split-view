import { useEffect, useState } from "react";

export const useWrapperTabs = (wrapper: HTMLElement) => {
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  useEffect(() => {
    // Try to find header for issues/PR/comments
    let header = wrapper.querySelector<HTMLElement>(
      ':scope > [class^="MarkdownEditor-module__header"]',
    );

    // If not found, try to find header for README editor
    if (!header) {
      header = wrapper.querySelector<HTMLElement>(
        '[class^="BlobEditHeader-module__Box"]',
      );
    }

    if (!header) return;

    const checkTab = () => {
      // Check for regular tabs (issues/PR/comments)
      let previewTab = header!.querySelector<HTMLButtonElement>(
        'button[role="tab"]:nth-child(2)',
      );

      let isActive =
        !!previewTab &&
        (previewTab.classList.contains("selected") ||
          previewTab.getAttribute("aria-selected") === "true");

      // If not found, check for SegmentedControl tabs (README editor)
      if (!previewTab) {
        const segmentedControlItems = header!.querySelectorAll<HTMLElement>(
          '[class^="prc-SegmentedControl-Item"]',
        );

        // Find the Preview tab (usually second item)
        segmentedControlItems.forEach((item, index) => {
          const button = item.querySelector("button");
          const textElement = button?.querySelector("[data-text]");
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
    const tabList = header.querySelector('[role="tablist"]');
    if (tabList) {
      tabObserver.observe(tabList, { attributes: true, subtree: true });
    }

    // Observe SegmentedControl for README editor
    const segmentedControl = header.querySelector(
      '[class^="prc-SegmentedControl"]',
    );
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
