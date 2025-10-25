import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const observer = new MutationObserver(() => {
  const allEditorWrappers = document.querySelectorAll<HTMLElement>(
    '[class^="MarkdownEditor-module__previewWrapper"]:not([data-split-view-initialized="true"]), [class^="Shared-module__CommentBox"]:not([data-split-view-initialized="true"])'
  );

  allEditorWrappers.forEach((wrapper) => {
    if (wrapper.dataset.splitViewInitialized === 'true') return;
    wrapper.dataset.splitViewInitialized = 'true';

    const tabContainer = wrapper.querySelector<HTMLElement>(
      '[class^="ViewSwitch-module__viewSwitch"]'
    );
    if (tabContainer) {
      const reactRootContainer = document.createElement('div');
      reactRootContainer.style.display = 'flex';
      tabContainer.appendChild(reactRootContainer);
      const root = createRoot(reactRootContainer);
      root.render(
        <React.StrictMode>
          <App editorWrapper={wrapper} />
        </React.StrictMode>
      );
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });
