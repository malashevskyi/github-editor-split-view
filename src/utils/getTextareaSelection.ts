interface TextareaSelection {
  textarea: HTMLTextAreaElement;
  fullText: string;
  selectedText: string;
  beforeText: string;
  afterText: string;
  start: number;
  end: number;
}

export function getTextareaSelection(
  textarea: HTMLTextAreaElement
): TextareaSelection | null {
  if (!textarea) return null;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const fullText = textarea.value;

  return {
    textarea,
    fullText,
    selectedText: fullText.substring(start, end),
    beforeText: fullText.substring(0, start),
    afterText: fullText.substring(end),
    start,
    end,
  };
}
