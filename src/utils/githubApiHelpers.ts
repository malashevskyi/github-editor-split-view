/**
 * GitHub API helper functions for README preview refresh.
 *
 * WHY: README editor in split mode needs live preview updates, but GitHub's
 * preview only updates when you click the "Preview" tab. In split mode,
 * both Write and Preview are visible simultaneously, so we need to manually
 * refresh the preview as the user types.
 *
 * PROBLEM: We can't just grab the HTML - GitHub renders markdown server-side
 * using their internal API. We need to:
 * 1. Extract API endpoint URLs from page
 * 2. Get CSRF tokens (GitHub requires these for security)
 * 3. Send markdown content to GitHub's preview API
 * 4. Inject the returned HTML into the preview area
 *
 * These helpers encapsulate all the GitHub-specific API logic, keeping
 * the hook code clean and focused on the React lifecycle.
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
 * Extracts GitHub API configuration from embedded React payload.
 *
 * WHY: GitHub embeds all page data in a <script> tag as JSON.
 * This includes:
 * - API endpoint URLs (where to POST for preview)
 * - Current file info (filename, commit hash)
 * - CSRF tokens (required for POST requests)
 *
 * We extract this once when split mode activates, avoiding repeated
 * DOM queries. If extraction fails, preview updates won't work, but
 * the editor still functions normally.
 *
 * The fallback to hidden <input> handles cases where CSRF token isn't
 * in the React payload but exists elsewhere on the page.
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

    // Fallback: try hidden input (GitHub sometimes stores token here)
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
 * Extracts text content from CodeMirror editor DOM.
 *
 * WHY: CodeMirror stores each line in a separate <div class="cm-line">.
 * To get the full text, we must:
 * 1. Find all line elements
 * 2. Extract textContent from each
 * 3. Join with newlines to preserve line breaks
 *
 * This is necessary because CodeMirror doesn't expose a simple .value
 * property like textarea. We're reading the DOM representation that
 * CodeMirror renders for syntax highlighting.
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
 * Sends markdown to GitHub's preview API and returns rendered HTML.
 *
 * We must send FormData (not JSON) because that's what GitHub's API expects.
 * The request includes:
 * - code: the markdown text
 * - commit: current git commit (for context)
 * - blobname: filename (affects rendering, e.g., .md vs .markdown)
 * - authenticity_token: CSRF protection
 *
 * Returns null on error, letting the caller decide how to handle failures
 * (usually just skip the preview update silently).
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
    credentials: "include", // Send cookies for authentication
  });

  if (!response.ok) {
    console.error("[GitHubAPI] Response error:", response.status);
    return null;
  }

  const { data } = await response.json();
  return data?.html ? data : null;
}

/**
 * Injects rendered HTML into the preview area.
 *
 * WHY: After getting HTML from GitHub's API, we need to display it.
 * The preview area contains a .markdown-body div where GitHub normally
 * shows rendered content. We replace its innerHTML with the new HTML.
 *
 * We query the wrapper each time (not caching) because GitHub's React
 * can re-render the preview area, destroying our cached reference.
 *
 * The wildcard selector fallback handles CSS module hash variations
 * (e.g., markdown-body_abc123 in different GitHub versions).
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
