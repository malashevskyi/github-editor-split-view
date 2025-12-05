import React, { useState } from "react";
import { SplitButton } from "./components/SplitButton";
import { Toolbar } from "./components/Toolbar";
import { useSplitMode } from "./hooks/useSplitMode";
import { useWrapperTabs } from "./hooks/useWrapperTabs";
import { useGitHubPreviewRefresh } from "./hooks/useGitHubPreviewRefresh";

interface AppProps {
  editorWrapper: HTMLElement;
}

const App: React.FC<AppProps> = ({ editorWrapper }) => {
  const { isPreviewActive } = useWrapperTabs(editorWrapper);
  const [isSplitMode, setSplitMode] = useState(false);

  useSplitMode(editorWrapper, isSplitMode);
  useGitHubPreviewRefresh(editorWrapper, isSplitMode);

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
