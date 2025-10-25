import { useEffect, useState } from 'react';
import { formatText } from '../utils/formatText';

export function useMarkdownFormatter(wrapper: HTMLElement) {
  const [textarea, setTextarea] = useState<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = wrapper.querySelector<HTMLTextAreaElement>('textarea');
    setTextarea(textarea);
  }, [wrapper]);

  const format = (type: string) => {
    if (!textarea) return;
    formatText(type, textarea);
  };

  return format;
}
