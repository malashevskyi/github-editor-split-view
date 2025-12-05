/**
 * GitHub API helper functions for preview refresh
 */

import { SELECTORS } from "../constants/selectors";

interface GitHubPayload {
  payload?: {
    editInfo?: {
      previewEditPath?: string;
      fileName?: string;
    };
    refInfo?: {
      currentOid?: string;
    };
    csrf_tokens?: Record<string, { post?: string }>;
  };
}

interface GitHubData {
  previewUrl: string | null;
  commitOid: string | null;
  fileName: string | null;
  authenticityToken: string | null;
}

/**
 * Extracts GitHub API data from embedded React app payload
 */
export function extractGitHubData(): GitHubData {
  const result: GitHubData = {
    previewUrl: null,
    commitOid: null,
    fileName: null,
    authenticityToken: null,
  };

  const reactAppScript = document.querySelector(SELECTORS.REACT_APP_PAYLOAD);

  if (!reactAppScript) return result;

  try {
    const payload: GitHubPayload = JSON.parse(
      reactAppScript.textContent || "{}",
    );
    const editInfo = payload?.payload?.editInfo;
    const refInfo = payload?.payload?.refInfo;
    const csrfTokens = payload?.payload?.csrf_tokens;

    result.previewUrl = editInfo?.previewEditPath || null;
    result.commitOid = refInfo?.currentOid || null;
    result.fileName = editInfo?.fileName || null;

    if (csrfTokens && result.previewUrl) {
      result.authenticityToken = csrfTokens[result.previewUrl]?.post || null;
    }

    // Fallback: try hidden input
    if (!result.authenticityToken) {
      const tokenInput = document.querySelector<HTMLInputElement>(
        SELECTORS.AUTHENTICITY_TOKEN,
      );
      result.authenticityToken = tokenInput?.value || null;
    }
  } catch (e) {
    console.error("[GitHubAPI] Failed to parse payload:", e);
  }

  return result;
}

/**
 * Extracts content from CodeMirror editor
 */
export function extractCodeMirrorContent(
  codeMirrorEditor: Element,
): string | null {
  const cmContent = codeMirrorEditor.querySelector(SELECTORS.CM_CONTENT);
  if (!cmContent) return null;

  const lines = Array.from(cmContent.querySelectorAll(SELECTORS.CM_LINE));
  return lines.map((line) => line.textContent || "").join("\n");
}

/**
 * Sends preview request to GitHub API
 */
export async function fetchPreview(
  content: string,
  previewUrl: string,
  commitOid: string,
  fileName: string,
  authenticityToken: string,
): Promise<{ html: string } | null> {
  const formData = new FormData();
  formData.append("code", content);
  formData.append("commit", commitOid);
  formData.append("blobname", fileName);
  formData.append("willcreatebranch", "false");
  formData.append("checkConflict", "true");
  formData.append("authenticity_token", authenticityToken);

  const response = await fetch(`${previewUrl}?avoiddiff=true`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    console.error("[GitHubAPI] Response error:", response.status);
    return null;
  }

  const { data } = await response.json();
  return data?.html ? data : null;
}

/**
 * Updates preview area with new HTML content
 */
export function updatePreviewHTML(
  editorWrapper: HTMLElement,
  html: string,
): void {
  const previewArea = editorWrapper.querySelector<HTMLElement>(
    SELECTORS.PREVIEW_AREA_README,
  );

  const markdownBody =
    previewArea?.querySelector(SELECTORS.MARKDOWN_BODY) ||
    previewArea?.querySelector(SELECTORS.MARKDOWN_BODY_WILDCARD);

  if (markdownBody) {
    markdownBody.innerHTML = html;
  }
}
