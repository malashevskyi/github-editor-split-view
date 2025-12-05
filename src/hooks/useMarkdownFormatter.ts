import { useEffect, useState } from "react";
import { formatMarkdown } from "../utils/formatMarkdown";
import { findEditor } from "../utils/editorSelectors";

/**
 * Hook that provides a markdown formatting function for toolbar buttons.
 *
 * WHY: Toolbar buttons need to format the text in the editor, but:
 * 1. The editor might not exist immediately (React rendering)
 * 2. GitHub might dynamically replace the editor (tab switching)
 * 3. We want to avoid querying the DOM on every button click (performance)
 *
 * SOLUTION:
 * - Cache the editor element after first render
 * - If cached editor exists, use it (fast path)
 * - If cache is stale, find editor on-demand (fallback)
 *
 * This gives us good performance (cached access) with reliability
 * (fallback if DOM changes). The Toolbar component uses this hook
 * to get a format() function it can call on button clicks.
 */
export function useMarkdownFormatter(wrapper: HTMLElement) {
  const [editor, setEditor] = useState<
    HTMLTextAreaElement | HTMLElement | null
  >(null);

  // Find and cache editor element on mount
  useEffect(() => {
    const foundEditor = findEditor(wrapper);
    if (foundEditor) {
      setEditor(foundEditor);
    }
  }, [wrapper]);

  const format = (type: string) => {
    // Fast path: use cached editor if available
    if (editor) {
      formatMarkdown(type, editor);
      return;
    }

    // Slow path: find editor on demand if cache is stale
    // (happens if GitHub's React recreated the editor after we cached it)
    const foundEditor = findEditor(wrapper);
    if (foundEditor) {
      formatMarkdown(type, foundEditor);
    }
  };

  return format;
}
