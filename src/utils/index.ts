/**
 * Core Utility Helper Functions
 */

export function formatTicketId(prefix = 'MUNI'): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${new Date().getFullYear()}-${randomSuffix}`;
}

export function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch {
    return isoString;
  }
}

export function truncateText(text: string, maxLength = 80): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
