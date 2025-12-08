import React, { useEffect, useState } from "react";
import { SplitButton } from "./components/SplitButton";
import { Toolbar } from "./components/Toolbar";
import { useGitHubPreviewRefresh } from "./hooks/useGitHubPreviewRefresh";
import { useSplitMode, type ViewType } from "./hooks/useSplitMode";
import { useWrapperTabs } from "./hooks/useWrapperTabs";

interface AppProps {
  editorWrapper: HTMLElement;
  viewType: ViewType;
}

const App: React.FC<AppProps> = ({ editorWrapper, viewType }) => {
  const { isPreviewActive } = useWrapperTabs(editorWrapper);
  const [isSplitMode, setSplitMode] = useState(false);

  useSplitMode(editorWrapper, isSplitMode, viewType);
  useGitHubPreviewRefresh(editorWrapper, isSplitMode);

  /**
   * Auto-disable split mode when Write/Edit/Preview tab is clicked.
   *
   * WHY: When user clicks Write/Edit tab while in split mode, GitHub tries to hide
   * preview and show only editor. But our split mode keeps preview visible,
   * causing conflicts:
   * - Preview element gets removed from its position but split styles remain
   * - Text overlaps and layout breaks
   *
   * SOLUTION:
   * It is not enough to use isPreviewActive change due to race conditions
   * We need to detect Write/Edit/Preview tab clicks and automatically turn off split mode.
   */
  useEffect(() => {
    const handleTabClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // If the click was made by a script (e.g., our auto-refresh in Old PR),
      // then event.isTrusted will be false. We ignore such clicks.
      if (!event.isTrusted) return;

      if (
        ["Edit", "Write", "Preview"].includes(target.textContent?.trim()) &&
        target.closest("button")
      ) {
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
