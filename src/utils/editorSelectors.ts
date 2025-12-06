import { SELECTORS } from "../constants/selectors";

/**
 * Utility functions to find editor elements in GitHub's DOM.
 *
 * WHY: GitHub uses completely different DOM structures for different pages:
 * - Issues/PRs use <textarea> with specific class names
 * - README uses CodeMirror with contenteditable
 * - Headers, tabs, and preview areas all have different selectors
 *
 * Instead of writing "try selector A, then try selector B" logic everywhere,
 * we centralize it here. This makes the codebase much cleaner and easier
 * to update when GitHub changes their HTML structure.
 *
 * Each function tries both selector variants and returns the first match,
 * making our extension work across all GitHub editor types transparently.
 */

/**
 * Finds the main text editor element (textarea or contenteditable).
 *
 * WHY: We need to detect which editor type GitHub is using:
 * - textarea = issues/comments/discussions (older editor)
 * - contenteditable = README files (CodeMirror 6)
 *
 * The formatting logic differs between these two (textarea.value vs DOM manipulation),
 * so we need to identify which one we're working with before applying formatting.
 */
export function findEditor(
  wrapper: HTMLElement,
): HTMLTextAreaElement | HTMLElement | null {
  // Try textarea first (for issues/comments)
  const textarea = wrapper.querySelector<HTMLTextAreaElement>(
    SELECTORS.TEXTAREA,
  );
  if (textarea) return textarea;

  // Try contenteditable (for README)
  const contentEditable = wrapper.querySelector<HTMLElement>(
    SELECTORS.CONTENTEDITABLE,
  );
  if (contentEditable) return contentEditable;

  return null;
}

/**
 * Finds the header element containing Write/Preview tabs.
 *
 * WHY: We inject our "Split" button into the header, next to Write/Preview tabs.
 * Different GitHub pages have different header elements, so we need to find
 * the right one to avoid placing our button in the wrong location.
 */
export function findHeader(wrapper: HTMLElement): HTMLElement | null {
  // Try header for issues/PR/comments
  let header = wrapper.querySelector<HTMLElement>(SELECTORS.HEADER_ISSUES);

  // If not found, try header for README editor
  if (!header) {
    header = wrapper.querySelector<HTMLElement>(SELECTORS.HEADER_README);
  }

  return header;
}

/**
 * Finds the write area element (container with the editor).
 *
 * WHY: In split mode, we need to apply CSS grid layout to the container
 * that holds the editor. This resizes it to 50% width so preview can
 * appear side-by-side. Different pages have different container structures,
 * so we need to find the correct element to apply grid styles.
 */
export function findWriteArea(wrapper: HTMLElement): HTMLElement | null {
  // Try for issues/PR/comments
  let writeArea = wrapper.querySelector<HTMLElement>(
    SELECTORS.WRITE_AREA_ISSUES,
  );

  // If not found, try for README editor
  if (!writeArea) {
    writeArea = wrapper.querySelector<HTMLElement>(SELECTORS.WRITE_AREA_README);
  }

  return writeArea;
}

/**
 * Finds the preview area element (where rendered markdown appears).
 *
 * WHY: In split mode, we need to show the preview area (normally hidden
 * behind the Write tab). We apply CSS to make it visible and position it
 * next to the editor. Different pages have different preview containers,
 * so we need to find the right one.
 */
export function findPreviewArea(wrapper: HTMLElement): HTMLElement | null {
  // Try for issues/PR/comments
  let previewArea = wrapper.querySelector<HTMLElement>(
    SELECTORS.PREVIEW_AREA_ISSUES,
  );

  // If not found, try for README editor
  if (!previewArea) {
    previewArea = wrapper.querySelector<HTMLElement>(
      SELECTORS.PREVIEW_AREA_README,
    );
  }

  return previewArea;
}

/**
 * Finds the inner scrollable container for README editor.
 *
 * WHY: README editor has nested structure:
 * - Outer: .react-code-view-edit (full height, no scroll)
 * - Inner: file-attachment > first div (actual editor height with scroll)
 *
 * We need to apply flex layout to the FIRST DIV inside file-attachment
 * so write/preview areas share the same scrollable space, preventing preview overflow.
 *
 * Returns null for Issues/Comments (they don't have this nested structure).
 */
export function findReadmeScrollContainer(
  wrapper: HTMLElement,
): HTMLElement | null {
  const writeArea = wrapper.querySelector<HTMLElement>(
    SELECTORS.WRITE_AREA_README,
  );
  if (!writeArea) return null;

  const fileAttachment = writeArea.querySelector<HTMLElement>(
    SELECTORS.WRITE_AREA_README_INNER,
  );
  if (!fileAttachment) return null;

  // Get the first div inside file-attachment - that's the actual scroll container
  const firstDiv = fileAttachment.querySelector<HTMLElement>("div");
  return firstDiv;
}
