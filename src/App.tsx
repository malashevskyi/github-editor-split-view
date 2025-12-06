import React, { useState, useEffect } from "react";
import { SplitButton } from "./components/SplitButton";
import { Toolbar } from "./components/Toolbar";
import { useSplitMode } from "./hooks/useSplitMode";
import { useWrapperTabs } from "./hooks/useWrapperTabs";
import { useGitHubPreviewRefresh } from "./hooks/useGitHubPreviewRefresh";
import { UI_TEXT } from "./constants/selectors";

interface AppProps {
  editorWrapper: HTMLElement;
}

const App: React.FC<AppProps> = ({ editorWrapper }) => {
  const { isPreviewActive } = useWrapperTabs(editorWrapper);
  const [isSplitMode, setSplitMode] = useState(false);

  useSplitMode(editorWrapper, isSplitMode);
  useGitHubPreviewRefresh(editorWrapper, isSplitMode);

  /**
   * Auto-disable split mode when Write/Edit tab is clicked.
   *
   * WHY: When user clicks Write/Edit tab while in split mode, GitHub tries to hide
   * preview and show only editor. But our split mode keeps preview visible,
   * causing conflicts:
   * - Preview element gets removed from its position but split styles remain
   * - Text overlaps and layout breaks
   * - Sometimes GitHub shows "Error, Something Wrong" or blank screen
   *
   * SOLUTION: Detect Write/Edit tab clicks and automatically turn off split mode.
   * This cleanly restores original styles before GitHub manipulates the DOM.
   *
   * HANDLES:
   * - README: "Edit" button with data-text="Edit"
   * - Issues/Comments: "Write" tab with role="tab"
   */
  useEffect(() => {
    const handleTabClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // README uses SegmentedControl with data-text="Edit"
      const segmentedControlText = target.closest('[data-text="Edit"]');
      if (segmentedControlText) {
        const button = segmentedControlText.closest("button");
        if (button && isSplitMode) {
          console.log("[App] Edit button clicked, disabling split mode");
          setSplitMode(false);
          return;
        }
      }

      // Issues/Comments use role="tab"
      const tabButton = target.closest('button[role="tab"]');
      if (!tabButton) return;

      // Check if this is Write/Edit tab (first tab)
      const tabText = tabButton.textContent?.trim().toLowerCase();
      const isWriteOrEditTab =
        tabText === UI_TEXT.WRITE_TAB || tabText === UI_TEXT.EDIT_TAB;

      if (isWriteOrEditTab && isSplitMode) {
        console.log(`[App] ${tabText} tab clicked, disabling split mode`);
        setSplitMode(false);
      }
    };

    editorWrapper.addEventListener("click", handleTabClick, true); // Use capture phase
    return () => {
      editorWrapper.removeEventListener("click", handleTabClick, true);
    };
  }, [editorWrapper, isSplitMode]);

  // Keep component mounted but hidden to preserve observer
  return (
    <div
      style={{
        display: isPreviewActive ? "flex" : "none",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
      }}
    >
      <SplitButton
        isSplit={isSplitMode}
        onClick={() => setSplitMode((prev) => !prev)}
      />
      {isSplitMode && <Toolbar wrapper={editorWrapper} />}
    </div>
  );
};

export default App;
