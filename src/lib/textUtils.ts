/**
 * Truncate text to a specified length without breaking words
 * @param text - The text to truncate
 * @param maxLength - Maximum length of the truncated text
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (!text || text.length <= maxLength) {
    return text;
  }

  // Find the last space before maxLength
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  // If there's a space, cut at the space to avoid breaking words
  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  // Otherwise, just add ellipsis
  return truncated + '...';
}
