/**
 * Manually triggers an 'input' event on a textarea element.
 *
 * WHY: When we programmatically change textarea.value, GitHub's JavaScript
 * doesn't detect the change (no native 'input' event fires).
 *
 * This causes two problems:
 * 1. Live preview doesn't update
 * 2. GitHub's "unsaved changes" warning doesn't appear
 *
 * By manually dispatching an 'input' event with bubbles:true, we trick
 * GitHub's event listeners into thinking the user typed the text,
 * making everything work as expected.
 *
 * Without this, formatting would appear in the textarea but preview
 * would show old content until user types something.
 */
export function triggerInputEvent(
  inputElement: HTMLTextAreaElement | HTMLInputElement | HTMLElement,
  event?: "input" | "change",
): void {
  const inputEvent = new Event(event || "input", { bubbles: true });
  inputElement.dispatchEvent(inputEvent);
}
