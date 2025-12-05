/**
 * CSS selectors used to find GitHub DOM elements.
 * Centralized to make updates easier when GitHub changes their DOM structure.
 */

// Editor wrapper selectors (used in content.tsx)
export const EDITOR_WRAPPER_SELECTORS = [
  '[class^="MarkdownEditor-module__previewWrapper"]:not([data-split-view-initialized="true"])',
  '[class^="Shared-module__CommentBox"]:not([data-split-view-initialized="true"])',
  '[class*="Panel-module__Box"][class*="BlobEditor-module__Panel"]:not([data-split-view-initialized="true"])',
].join(", ");

// Editor selectors
export const SELECTORS = {
  // Text editors
  TEXTAREA: "textarea",
  CONTENTEDITABLE: '.cm-content[contenteditable="true"]',
  CODEMIRROR: ".cm-editor",

  // Headers
  HEADER_ISSUES: '[class^="MarkdownEditor-module__header"]',
  HEADER_README: '[class^="BlobEditHeader-module__Box"]',

  // Tab containers
  TAB_CONTAINER_ISSUES: '[class^="ViewSwitch-module__viewSwitch"]',
  TAB_CONTAINER_README: '[class*="BlobEditHeader-module__Box_1"]',

  // Write areas
  WRITE_AREA_ISSUES: '[class^="InlineAutocomplete-module__container"]',
  WRITE_AREA_README: ".react-code-view-edit",
  TEXTAREA_SPAN: 'span[class^="MarkdownInput-module__textArea"]',

  // Preview areas
  PREVIEW_AREA_ISSUES: '[class^="MarkdownEditor-module__previewViewerWrapper"]',
  PREVIEW_AREA_README: '[class*="BlobEditor-module__Box_4"]',

  // Tab elements
  TAB_LIST: '[role="tablist"]',
  TAB_BUTTON: 'button[role="tab"]:nth-child(2)',
  SEGMENTED_CONTROL: '[class^="prc-SegmentedControl"]',
  SEGMENTED_CONTROL_ITEM: '[class^="prc-SegmentedControl-Item"]',
  TAB_BUTTON_INNER: "button",
  TAB_TEXT: "[data-text]",

  // CodeMirror elements
  CM_CONTENT: ".cm-content",
  CM_LINE: ".cm-line",

  // Markdown elements
  MARKDOWN_BODY: ".markdown-body",
  MARKDOWN_BODY_WILDCARD: '[class*="markdown-body"]',

  // GitHub API elements
  REACT_APP_PAYLOAD: '[data-target="react-app.embeddedData"]',
  AUTHENTICITY_TOKEN: 'input[name="authenticity_token"]',
} as const;
