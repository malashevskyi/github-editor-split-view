import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { EDITOR_WRAPPER_SELECTORS, SELECTORS } from "./constants/selectors";
import { TIMINGS } from "./constants/timings";

const DEBOUNCE_DELAY = 100;

let debounceTimeout: ReturnType<typeof setTimeout>;

/**
 * Initializes split view for all matching editor wrappers
 */
const initializeSplitView = () => {
  const allEditorWrappers = document.querySelectorAll<HTMLElement>(
    EDITOR_WRAPPER_SELECTORS,
  );

  allEditorWrappers.forEach((wrapper) => {
    // Skip if already initialized
    if (wrapper.dataset.splitViewInitialized === "true") return;

    wrapper.dataset.splitViewInitialized = "true";

    // Try to find ViewSwitch (for issues/PR/comments)
    let tabContainer = wrapper.querySelector<HTMLElement>(
      SELECTORS.TAB_CONTAINER_ISSUES,
    );

    let isReadmeEditor = false;
    let isOldPRUI = false;

    // If not found, try old PR UI
    if (!tabContainer) {
      tabContainer = wrapper.querySelector<HTMLElement>(
        SELECTORS.TAB_CONTAINER_OLD_PR,
      );
      isOldPRUI = !!tabContainer;
    }

    // If not found, try to find tab container in README editor
    if (!tabContainer) {
      const blobEditHeader = wrapper.querySelector<HTMLElement>(
        SELECTORS.HEADER_README,
      );

      if (blobEditHeader) {
        tabContainer = blobEditHeader.querySelector<HTMLElement>(
          SELECTORS.TAB_CONTAINER_README,
        );
        isReadmeEditor = !!tabContainer;
      }
    }

    if (!tabContainer) return;

    const reactRootContainer = document.createElement("div");
    reactRootContainer.style.display = "flex";

    // For README editor, insert after the <ul> element
    if (isReadmeEditor) {
      const segmentedControl = tabContainer.querySelector(
        SELECTORS.SEGMENTED_CONTROL,
      );
      if (segmentedControl && segmentedControl.nextSibling) {
        tabContainer.insertBefore(
          reactRootContainer,
          segmentedControl.nextSibling,
        );
      } else {
        tabContainer.appendChild(reactRootContainer);
      }
    } else if (isOldPRUI) {
      // For old PR UI, append after the tabs
      tabContainer.appendChild(reactRootContainer);
    } else {
      // For issues/PR, append as before
      tabContainer.appendChild(reactRootContainer);
    }

    const root = createRoot(reactRootContainer);
    root.render(
      <React.StrictMode>
        <App editorWrapper={wrapper} />
      </React.StrictMode>,
    );
  });
};

let observer: MutationObserver | null = null;

/**
 * Sets up MutationObserver to detect dynamically added editors
 */
const setupObserver = () => {
  // Disconnect previous observer if exists
  if (observer) observer.disconnect();

  observer = new MutationObserver((mutations) => {
    let shouldInitialize = false;

    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;

      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        if (
          node.matches(EDITOR_WRAPPER_SELECTORS) ||
          node.querySelector(EDITOR_WRAPPER_SELECTORS) ||
          // detect issues start editing area (menu (three dots) > edit)
          (node.className &&
            typeof node.className === "string" &&
            node.className.includes("MarkdownEditor-module"))
        ) {
          shouldInitialize = true;
          break;
        }
      }
      if (shouldInitialize) break;
    }

    if (shouldInitialize) {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(initializeSplitView, DEBOUNCE_DELAY);
    }
  });

  // Observe for dynamic content
  observer.observe(document.body, { childList: true, subtree: true });
};

// Initial setup
setupObserver();
initializeSplitView();

/**
 * Re-initializes after navigation events
 */
const reinitialize = () => {
  setupObserver();
  initializeSplitView();
};

// Listen for Turbo navigation events (GitHub uses Turbo for SPA navigation)
document.addEventListener("turbo:load", () => {
  console.log("[Split View] Turbo navigation detected (turbo:load)");
  reinitialize();
});

document.addEventListener("turbo:render", () => {
  console.log("[Split View] Turbo navigation detected (turbo:render)");
  reinitialize();
});

// Also listen for soft-nav events (GitHub's custom navigation system)
document.addEventListener("soft-nav:success", () => {
  console.log("[Split View] GitHub soft-nav detected");
  reinitialize();
});

// Fallback: listen for popstate (browser back/forward)
window.addEventListener("popstate", () => {
  console.log("[Split View] Popstate detected (browser navigation)");
  setTimeout(reinitialize, TIMINGS.DOM_REINIT_DELAY);
});
