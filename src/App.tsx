import React, { useEffect, useState } from "react";
import { SplitButton } from "./components/SplitButton";
import { Toolbar } from "./components/Toolbar";
import { useGitHubPreviewRefresh } from "./hooks/useGitHubPreviewRefresh";
import { useSplitMode } from "./hooks/useSplitMode";
import { useWrapperTabs } from "./hooks/useWrapperTabs";

interface AppProps {
  editorWrapper: HTMLElement;
}

const App: React.FC<AppProps> = ({ editorWrapper }) => {
  const { isPreviewActive } = useWrapperTabs(editorWrapper);
  const [isSplitMode, setSplitMode] = useState(false);

  useSplitMode(editorWrapper, isSplitMode);
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
   * SOLUTION: Detect Write/Edit/Preview tab clicks and automatically turn off split mode.
   */
  useEffect(() => {
    const handleTabClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

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
