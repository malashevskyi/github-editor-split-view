import { useEffect, useState } from 'react';

export const useWrapperTabs = (wrapper: HTMLElement) => {
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  useEffect(() => {
    const header = wrapper.querySelector<HTMLElement>(
      ':scope > [class^="MarkdownEditor-module__header"]'
    );
    if (!header) return;

    const checkTab = () => {
      const previewTab = header.querySelector<HTMLButtonElement>(
        'button[role="tab"]:nth-child(2)'
      );
      const isActive =
        !!previewTab &&
        (previewTab.classList.contains('selected') ||
          previewTab.getAttribute('aria-selected') === 'true');
      setIsPreviewActive(isActive);
    };

    checkTab();
    const tabObserver = new MutationObserver(checkTab);
    const tabList = header.querySelector('[role="tablist"]');
    if (tabList) {
      tabObserver.observe(tabList, { attributes: true, subtree: true });
    }

    return () => tabObserver.disconnect();
  }, [wrapper]);

  return { isPreviewActive };
};
