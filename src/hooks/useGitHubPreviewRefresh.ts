import { useEffect } from "react";
import {
  extractGitHubData,
  extractCodeMirrorContent,
  fetchPreview,
  updatePreviewHTML,
} from "../utils/githubApiHelpers";
import { SELECTORS } from "../constants/selectors";

const DEBOUNCE_DELAY = 1000;

/**
 * Auto-refreshes README preview in split mode as user types.
 *
 * WHY: In split mode, both Write and Preview are visible simultaneously.
 * But GitHub's preview only updates when you manually click the Preview tab.
 *
 * PROBLEM: If we don't refresh automatically, users type in Write area
 * but preview shows stale content → confusing and defeats the purpose
 * of split view.
 *
 * SOLUTION:
 * 1. Watch CodeMirror DOM for changes (MutationObserver)
 * 2. Debounce updates (wait 1s after last keystroke)
 * 3. Extract markdown from CodeMirror
 * 4. Send to GitHub's preview API
 * 5. Inject returned HTML into preview area
 *
 * WHY DEBOUNCE: Sending API request on every keystroke would:
 * - Spam GitHub's servers (rate limit risk)
 * - Cause UI jank (slow network)
 * - Waste bandwidth
 *
 * This hook only runs for README editor (CodeMirror). Issues/comments
 * use GitHub's built-in preview refresh.
 */
export function useGitHubPreviewRefresh(
  editorWrapper: HTMLElement | null,
  isSplit: boolean,
) {
  useEffect(() => {
    // Only run in split mode with valid wrapper
    if (!editorWrapper || !isSplit) return;

    const codeMirrorEditor = editorWrapper.querySelector(SELECTORS.CODEMIRROR);
    const previewArea = editorWrapper.querySelector(
      SELECTORS.PREVIEW_AREA_README,
    );

    // Only works for README (CodeMirror editor)
    if (!codeMirrorEditor || !previewArea) return;

    // Extract GitHub API configuration once on mount
    const { previewUrl, commitOid, fileName, authenticityToken } =
      extractGitHubData();

    if (!previewUrl || !commitOid || !fileName || !authenticityToken) {
      console.error("[PreviewRefresh] Missing required GitHub data");
      return;
    }

    let updateTimeout: ReturnType<typeof setTimeout>;
    let isRefreshing = false; // Prevent concurrent API calls

    const refreshPreview = async () => {
      if (isRefreshing) return;
      isRefreshing = true;

      try {
        const content = extractCodeMirrorContent(codeMirrorEditor);
        if (!content) return;

        const result = await fetchPreview(
          content,
          previewUrl,
          commitOid,
          fileName,
          authenticityToken,
        );

        if (result?.html) {
          updatePreviewHTML(editorWrapper, result.html);
        }
      } catch (error) {
        console.error("[PreviewRefresh] Error:", error);
      } finally {
        isRefreshing = false;
      }
    };

    // Debounced observer for content changes
    const observer = new MutationObserver(() => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(refreshPreview, DEBOUNCE_DELAY);
    });

    const contentArea = codeMirrorEditor.querySelector(SELECTORS.CM_CONTENT);
    if (contentArea) {
      observer.observe(contentArea, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      clearTimeout(updateTimeout);
      observer.disconnect();
    };
  }, [editorWrapper, isSplit]);
}
