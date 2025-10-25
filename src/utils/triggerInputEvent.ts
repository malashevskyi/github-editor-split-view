/**
 * Manually triggers an 'input' event on the given textarea or input.
 * This forces GitHub's live preview to update after the extension programmatically changes the text.
 */
export function triggerInputEvent(
  inputElement: HTMLTextAreaElement | HTMLInputElement
): void {
  const inputEvent = new Event('input', { bubbles: true });
  inputElement.dispatchEvent(inputEvent);
}
