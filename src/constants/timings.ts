/**
 * Time constants used throughout the extension.
 *
 * WHY: Centralizing time values makes them easy to tune and understand.
 * These values are based on:
 * - User experience (delays should feel responsive)
 * - GitHub's behavior (giving time for DOM updates)
 * - Performance (debouncing to avoid excessive operations)
 */

export const TIMINGS = {
  /**
   * Debounce delay for preview refresh in OLD PR UI.
   *
   * WHY 500ms: Balance between responsiveness and performance.
   * - Too short: Excessive API calls while typing
   * - Too long: Preview feels laggy
   * 500ms means preview updates shortly after user stops typing.
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
   * Delay for resetting min-height on preview body after refresh.
   */
  PREVIEW_BODY_MIN_HEIGHT_RESET_DELAY: 100,
} as const;
