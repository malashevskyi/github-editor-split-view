import { useEffect, useRef } from 'react';

export function useSplitMode(
  editorWrapper: HTMLElement | null,
  isSplit: boolean
  // isPreviewActive: boolean
) {
  const originalStyles = useRef(new Map<HTMLElement, string>());

  useEffect(() => {
    if (!editorWrapper) return;

    if (isSplit) {
      const styles = originalStyles.current;
      styles.set(editorWrapper, editorWrapper.getAttribute('style') || '');
      console.log(
        "editorWrapper.getAttribute('style')",
        editorWrapper.getAttribute('style')
      );
      editorWrapper.style.display = 'grid';
      editorWrapper.style.gridTemplateColumns = '1fr 1fr';

      const children = Array.from(editorWrapper.children) as HTMLElement[];
      children.forEach((child) => {
        styles.set(child, child.getAttribute('style') || '');
        child.style.setProperty('display', 'none', 'important');
      });

      const header = editorWrapper.querySelector<HTMLElement>(
        '[class^="MarkdownEditor-module__header"]'
      );
      const writeArea = editorWrapper.querySelector<HTMLElement>(
        '[class^="InlineAutocomplete-module__container"]'
      );
      const previewArea = editorWrapper.querySelector<HTMLElement>(
        '[class^="MarkdownEditor-module__previewViewerWrapper"]'
      );

      if (header) {
        header.style.setProperty('display', 'flex', 'important');
        header.style.gridColumn = '1 / 3';
      }
      if (writeArea) {
        writeArea.style.setProperty('display', 'block', 'important');

        // we need to show textarea wrapper span as well because it is set to display:none when the preview is open
        const span = writeArea.querySelector<HTMLElement>(
          'span[class^="MarkdownInput-module__textArea"]'
        );
        if (span) {
          styles.set(span, span.getAttribute('style') || '');
          span.style.setProperty('display', 'block', 'important');
        }
      }
      if (previewArea)
        previewArea.style.setProperty('display', 'block', 'important');
    } else {
      for (const [element, style] of originalStyles.current.entries()) {
        element.setAttribute('style', style);
      }
      originalStyles.current.clear();
    }
  }, [isSplit, editorWrapper]);
}
