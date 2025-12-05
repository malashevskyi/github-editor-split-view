import { useEffect, useState } from "react";
import { formatMarkdown } from "../utils/formatMarkdown";
import { findEditor } from "../utils/editorSelectors";

export function useMarkdownFormatter(wrapper: HTMLElement) {
  const [editor, setEditor] = useState<
    HTMLTextAreaElement | HTMLElement | null
  >(null);

  useEffect(() => {
    const foundEditor = findEditor(wrapper);
    if (foundEditor) {
      setEditor(foundEditor);
    }
  }, [wrapper]);

  const format = (type: string) => {
    // Use cached editor if available
    if (editor) {
      formatMarkdown(type, editor);
      return;
    }

    // Otherwise, try to find editor on demand
    const foundEditor = findEditor(wrapper);
    if (foundEditor) {
      formatMarkdown(type, foundEditor);
    }
  };

  return format;
}
