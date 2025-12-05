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
 * Auto-refreshes GitHub README preview when content changes in split mode
 */
export function useGitHubPreviewRefresh(
  editorWrapper: HTMLElement | null,
  isSplit: boolean,
) {
  useEffect(() => {
    if (!editorWrapper || !isSplit) return;

    const codeMirrorEditor = editorWrapper.querySelector(SELECTORS.CODEMIRROR);
    const previewArea = editorWrapper.querySelector(
      SELECTORS.PREVIEW_AREA_README,
    );

    if (!codeMirrorEditor || !previewArea) return;

    // Extract GitHub data once
    const { previewUrl, commitOid, fileName, authenticityToken } =
      extractGitHubData();

    if (!previewUrl || !commitOid || !fileName || !authenticityToken) {
      console.error("[PreviewRefresh] Missing required GitHub data");
      return;
    }

    let updateTimeout: ReturnType<typeof setTimeout>;
    let isRefreshing = false;

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
