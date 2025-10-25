import React, { useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { useSplitMode } from './hooks/useSplitMode';
import { useWrapperTabs } from './hooks/useWrapperTabs';

interface AppProps {
  editorWrapper: HTMLElement;
}

const App: React.FC<AppProps> = ({ editorWrapper }) => {
  const { isPreviewActive } = useWrapperTabs(editorWrapper);
  const [isSplitMode, setSplitMode] = useState(false);

  useSplitMode(editorWrapper, isSplitMode);

  if (!isPreviewActive) return null;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <button
        className="split-view-button-custom"
        onClick={() => setSplitMode((prev) => !prev)}
      >
        {isSplitMode ? 'Unsplit' : 'Split'}
      </button>
      {isSplitMode && <Toolbar wrapper={editorWrapper} />}
    </div>
  );
};

export default App;
