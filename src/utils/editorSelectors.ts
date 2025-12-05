import { SELECTORS } from "../constants/selectors";

/**
 * Utility functions to find editor elements in GitHub's DOM.
 * These selectors work for both issues/PRs/comments and README editors.
 */

/**
 * Finds the main text editor element (textarea or contenteditable).
 * Works for both issues/comments (textarea) and README (contenteditable).
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
 * Finds the header element containing tabs.
 * Works for both issues/comments and README editors.
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
 * Finds the write area element (container with editor).
 * Works for both issues/comments and README editors.
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
 * Finds the preview area element.
 * Works for both issues/comments and README editors.
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
