/**
 * Calculates reading time based on content
 */

const WORDS_PER_MINUTE = 225; // Average reading speed

/**
 * Calculate reading time in minutes from HTML content
 * @param content - HTML or plain text content
 * @returns reading time in minutes (minimum 1)
 */
export function calculateReadingTime(content: string): number {
  if (!content || typeof content !== 'string') {
    return 1;
  }
  
  // Remove HTML tags and decode entities for accurate word count
  const plainText = content
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, ' ') // Replace HTML entities with space
    .trim();
  
  // Split by whitespace and filter out empty strings
  const words = plainText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  
  // Calculate reading time (minimum 1 minute)
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

/**
 * Format reading time as a string
 * @param minutes - reading time in minutes
 * @returns formatted string like "5 min read"
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

/**
 * Calculate reading time from multiple content fields
 * @param title - post title
 * @param content - post content
 * @param excerpt - post excerpt
 * @returns reading time in minutes
 */
export function calculatePostReadingTime(
  title?: string,
  content?: string,
  excerpt?: string
): number {
  const combinedContent = [title, content, excerpt]
    .filter(Boolean)
    .join(' ');
  
  return calculateReadingTime(combinedContent);
}