/**
 * Extracts HTML code from a markdown message containing ```html blocks
 */
export function extractHtmlFromMessage(content: string): string | null {
  const match = content.match(/```html\s*\n([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}

/**
 * Checks if the message content contains an HTML code block
 */
export function hasHtmlCode(content: string): boolean {
  return /```html\s*\n/.test(content);
}
