/**
 * CSS selectors used to find GitHub DOM elements.
 *
 * WHY: GitHub frequently updates their UI and CSS class names (they use CSS modules
 * with generated names like "MarkdownEditor-module__previewWrapper__abc123").
 * By centralizing all selectors here, we only need to update them in ONE place
 * when GitHub changes their DOM structure, instead of hunting through 15+ files.
 *
 * This is especially critical for a browser extension that breaks when GitHub updates.
 */

/**
 * Finds all editor wrappers that haven't been initialized yet.
 *
 * WHY: We need to identify three different types of GitHub editors:
 * 1. Issues/PR comments (MarkdownEditor-module)
 * 2. Discussion comments (Shared-module__CommentBox)
 * 3. README file editor (BlobEditor-module)
 *
 * The :not([data-split-view-initialized]) prevents re-processing
 * editors we've already enhanced, avoiding duplicate UI elements.
 */
export const EDITOR_WRAPPER_SELECTORS = [
  '[class^="MarkdownEditor-module__previewWrapper"]:not([data-split-view-initialized="true"])',
  '[class^="Shared-module__CommentBox"]:not([data-split-view-initialized="true"])',
  '[class*="Panel-module__Box"][class*="BlobEditor-module__Panel"]:not([data-split-view-initialized="true"])',
].join(", ");

/**
 * UI text constants for GitHub interface.
 *
 * WHY: GitHub uses different tab labels across different pages.
 * By centralizing these text values, we can easily update them
 * if GitHub changes their UI text (e.g., translates to other languages).
 */
export const UI_TEXT = {
  WRITE_TAB: "write",
  EDIT_TAB: "edit",
  PREVIEW_TAB: "preview",
} as const;

export const SELECTORS = {
  // Text editors - WHY: Different GitHub pages use different editor types
  TEXTAREA: "textarea", // Used in older comment editors
  CONTENTEDITABLE: '.cm-content[contenteditable="true"]', // CodeMirror 6 in README editor
  CODEMIRROR: ".cm-editor", // CodeMirror container

  // Headers - WHY: We inject our Split button into the header, different pages have different headers
  HEADER_ISSUES: '[class^="MarkdownEditor-module__header"]', // Issues/PRs header
  HEADER_README: '[class^="BlobEditHeader-module__Box"]', // README editor header

  // Tab containers - WHY: We need to find where to inject the Split button
  TAB_CONTAINER_ISSUES: '[class^="ViewSwitch-module__viewSwitch"]', // Issues/PRs tabs
  TAB_CONTAINER_README: '[class*="BlobEditHeader-module__Box_1"]', // README tabs

  // Write areas - WHY: We need to apply grid layout to the write area in split mode
  WRITE_AREA_ISSUES: '[class^="InlineAutocomplete-module__container"]',
  WRITE_AREA_README: ".react-code-view-edit",
  WRITE_AREA_README_INNER: ".react-code-view-edit file-attachment", // Inner scrollable container for README
  TEXTAREA_SPAN: 'span[class^="MarkdownInput-module__textArea"]',

  // Preview areas - WHY: We need to show preview side-by-side with write area
  PREVIEW_AREA_ISSUES: '[class^="MarkdownEditor-module__previewViewerWrapper"]',
  PREVIEW_AREA_README: '[class*="BlobEditor-module__Box_4"]',

  // "Show Diff" button - WHY: This button doesn't work correctly in split mode, we need to hide it
  SHOW_DIFF_BUTTON: "label.BlobEditHeader-module__FormControl_Label--mgya9",
  SHOW_DIFF_CONTAINER: '[class*="BlobEditHeader-module__Box"]', // Container of Show Diff button

  // Tab elements - WHY: We need to detect which tab (Write/Preview) is active
  TAB_LIST: '[role="tablist"]',
  TAB_BUTTON: 'button[role="tab"]:nth-child(2)', // Preview tab (2nd button)
  SEGMENTED_CONTROL: '[class^="prc-SegmentedControl"]', // README uses SegmentedControl
  SEGMENTED_CONTROL_ITEM: '[class^="prc-SegmentedControl-Item"]',
  TAB_BUTTON_INNER: "button",
  TAB_TEXT: "[data-text]",

  // CodeMirror elements - WHY: README editor uses CodeMirror, we need to extract/update content
  CM_CONTENT: ".cm-content", // Contains the editable content
  CM_LINE: ".cm-line", // Each line of code/text

  // Markdown elements - WHY: We inject rendered preview HTML into these elements
  MARKDOWN_BODY: ".markdown-body",
  MARKDOWN_BODY_WILDCARD: '[class*="markdown-body"]', // Fallback for CSS module variants

  // GitHub API elements - WHY: README preview requires GitHub's API with CSRF tokens
  REACT_APP_PAYLOAD: '[data-target="react-app.embeddedData"]', // Contains API URLs and tokens
  AUTHENTICITY_TOKEN: 'input[name="authenticity_token"]', // CSRF protection
} as const;
