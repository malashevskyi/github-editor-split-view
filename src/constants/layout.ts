/**
 * Layout dimension constants used in split mode.
 */

export const LAYOUT = {
  /**
   * Maximum height for textarea and preview areas.
   *
   * WHY 90vh: Prevents elements from being taller than viewport.
   * - 90vh leaves space for GitHub's header/footer (10vh = ~80px)
   * - Prevents awkward scrolling where content is half-visible
   */
  MAX_HEIGHT: "90vh",

  /**
   * Minimum editor height in pixels.
   *
   * WHY 400px: Below this, editor becomes unusable.
   * Even on small screens or with many toolbars, user needs minimum space.
   */
  MIN_EDITOR_HEIGHT: 400,

  /**
   * Default/fallback height for textarea.
   *
   * WHY 400px: Reasonable default if we can't calculate height.
   * Shows ~20 lines of text at typical font size.
   */
  DEFAULT_TEXTAREA_HEIGHT: 400,
} as const;
