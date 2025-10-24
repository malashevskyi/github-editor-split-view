/**
 * Handles manual text formatting for the cloned toolbar.
 *
 * CONTEXT: GitHub's native toolbar is removed from the DOM when the 'Preview' tab  is active.
 * We create a clone of the toolbar to maintain its appearance in our split view.
 * Because this is a clone, its buttons lack the original event listeners.
 *
 * This function just add Markdown symbols to the write area
 *
 * @param formatType The type of Markdown formatting to apply (e.g., 'bold', 'italic').
 */

export function formatText(formatType: string): void {
  const textarea: HTMLTextAreaElement | null = document.querySelector(
    'textarea[aria-label="Markdown value"]'
  );
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const fullText = textarea.value;
  const selectedText = fullText.substring(start, end);

  let prefix = '',
    suffix = '';
  let isMultilineFormat = false;

  switch (formatType) {
    case 'heading':
      prefix = '### ';
      suffix = '';
      break;
    case 'bold':
      prefix = '**';
      suffix = '**';
      break;
    case 'italic':
      prefix = '_';
      suffix = '_';
      break;
    case 'quote':
      prefix = '> ';
      suffix = '';
      isMultilineFormat = true;
      break;
    case 'code':
      prefix = '`';
      suffix = '`';
      break;
    case 'link':
      prefix = '[';
      suffix = '](url)';
      break;
    case 'ul':
      prefix = '- ';
      suffix = '';
      isMultilineFormat = true;
      break;
    case 'ol':
      prefix = '1. ';
      suffix = '';
      isMultilineFormat = true;
      break;
    case 'task':
      prefix = '- [ ] ';
      suffix = '';
      isMultilineFormat = true;
      break;
  }

  const textBefore = fullText.substring(0, start);
  const textAfter = fullText.substring(end);

  if (selectedText.length > 0) {
    let shouldUnformat = false;
    if (prefix.length > 0 && suffix.length > 0) {
      if (selectedText.startsWith(prefix) && selectedText.endsWith(suffix)) {
        shouldUnformat = true;
      }
    } else if (prefix.length > 0 && suffix.length === 0) {
      if (selectedText.startsWith(prefix)) {
        shouldUnformat = true;
      }
    }

    if (shouldUnformat) {
      const newSelectedText = selectedText.substring(
        prefix.length,
        selectedText.length - suffix.length
      );
      textarea.value = textBefore + newSelectedText + textAfter;
      textarea.selectionStart = start;
      textarea.selectionEnd = start + newSelectedText.length;
      textarea.focus();
      return;
    }
  }

  let replacement = '';
  if (selectedText.length === 0) {
    replacement = prefix + suffix;
    textarea.value = textBefore + replacement + textAfter;
    textarea.selectionStart = textarea.selectionEnd = start + prefix.length;
  } else {
    const isSelectionMultiline = selectedText.includes('\n');
    if (isSelectionMultiline && isMultilineFormat) {
      if (formatType === 'ol') {
        replacement = selectedText
          .split('\n')
          .map((line, index) => `${index + 1}. ${line}`)
          .join('\n');
      } else {
        replacement = selectedText
          .split('\n')
          .map((line) => `${prefix}${line}`)
          .join('\n');
      }
    } else {
      replacement = prefix + selectedText + suffix;
    }
    textarea.value = textBefore + replacement + textAfter;
    textarea.selectionStart = start;
    textarea.selectionEnd = start + replacement.length;
  }

  // Trigger input event so external listeners detect the change
  const inputEvent = new Event('input', { bubbles: true });
  textarea.dispatchEvent(inputEvent);

  textarea.focus();
}
