import { getFormatSymbols } from "./getFormatSymbols";

/**
 * Handles text formatting for CodeMirror editor (used in README editor).
 *
 * CodeMirror 6 uses EditorView API instead of textarea.
 *
 * @param formatType The type of Markdown formatting to apply
 * @param editorView The CodeMirror EditorView instance
 */
export function formatCodeMirror(formatType: string, editorView: any): void {
  if (!editorView || !editorView.state || !editorView.dispatch) {
    console.error("[formatCodeMirror] Invalid EditorView instance");
    return;
  }

  try {
    const state = editorView.state;
    const selection = state.selection.main;
    const from = selection.from;
    const to = selection.to;
    const selectedText = state.doc.sliceString(from, to);

    const { prefix, suffix, isMultilineFormat } = getFormatSymbols(formatType);

    // Check if we should unformat (if text already has the formatting)
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
          selectedText.length - suffix.length,
        );

        editorView.dispatch({
          changes: { from, to, insert: newSelectedText },
          selection: { anchor: from, head: from + newSelectedText.length },
        });

        editorView.focus();
        return;
      }
    }

    // Format the text
    let replacement = "";
    if (selectedText.length === 0) {
      // No selection - just insert formatting symbols
      replacement = prefix + suffix;
      editorView.dispatch({
        changes: { from, to, insert: replacement },
        selection: { anchor: from + prefix.length, head: from + prefix.length },
      });
    } else {
      // Has selection - wrap or format line by line
      const isSelectionMultiline = selectedText.includes("\n");

      if (isSelectionMultiline && isMultilineFormat) {
        if (formatType === "ol") {
          replacement = selectedText
            .split("\n")
            .map((line: string, index: number) => `${index + 1}. ${line}`)
            .join("\n");
        } else {
          replacement = selectedText
            .split("\n")
            .map((line: string) => `${prefix}${line}`)
            .join("\n");
        }
      } else {
        replacement = prefix + selectedText + suffix;
      }

      editorView.dispatch({
        changes: { from, to, insert: replacement },
        selection: { anchor: from, head: from + replacement.length },
      });
    }

    editorView.focus();
  } catch (error) {
    console.error("[formatCodeMirror] Error during formatting:", error);
  }
}
