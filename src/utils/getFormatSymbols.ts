interface FormatSymbols {
  prefix: string;
  suffix: string;
  isMultilineFormat: boolean;
}

export function getFormatSymbols(formatType: string): FormatSymbols {
  switch (formatType) {
    case 'heading':
      return { prefix: '### ', suffix: '', isMultilineFormat: false };
    case 'bold':
      return { prefix: '**', suffix: '**', isMultilineFormat: false };
    case 'italic':
      return { prefix: '_', suffix: '_', isMultilineFormat: false };
    case 'quote':
      return { prefix: '> ', suffix: '', isMultilineFormat: true };
    case 'code':
      return { prefix: '`', suffix: '`', isMultilineFormat: false };
    case 'link':
      return { prefix: '[', suffix: '](url)', isMultilineFormat: false };
    case 'ul':
      return { prefix: '- ', suffix: '', isMultilineFormat: true };
    case 'ol':
      return { prefix: '1. ', suffix: '', isMultilineFormat: true };
    case 'task':
      return { prefix: '- [ ] ', suffix: '', isMultilineFormat: true };
    case 'mention':
      return { prefix: '@', suffix: '', isMultilineFormat: false };
    case 'reference':
      return { prefix: '#', suffix: '', isMultilineFormat: false };
    default:
      return { prefix: '', suffix: '', isMultilineFormat: false };
  }
}
