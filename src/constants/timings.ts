/**
 * Time constants used throughout the extension.
 */

export const TIMINGS = {
  /**
   * Debounce delay for preview refresh in OLD PR UI.
   */
  PREVIEW_REFRESH_DEBOUNCE: 500,

  /**
   * Delay for DOM reinitalization after page navigation.
   *
   * WHY 300ms: GitHub needs time to render new DOM elements.
   * After navigation (like clicking "Edit" button), we need to wait
   * for React to mount the editor before initializing our extension.
   */
  DOM_REINIT_DELAY: 300,

  /**
   * Delay for resetting min-height on preview body after refresh. Otherwise it leads to additional scrollbars in some cases in preview area.
   */
  PREVIEW_BODY_MIN_HEIGHT_RESET_DELAY: 100,
} as const;
