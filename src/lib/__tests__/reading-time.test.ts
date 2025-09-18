import { calculateReadingTime, formatReadingTime, calculatePostReadingTime } from '@/lib/reading-time';

describe('Reading Time Utils', () => {
  test('calculateReadingTime should calculate correctly', () => {
    // Test with approximately 225 words (should be ~1 minute)
    const content = 'word '.repeat(225);
    expect(calculateReadingTime(content)).toBe(1);
    
    // Test with approximately 450 words (should be ~2 minutes)
    const longContent = 'word '.repeat(450);
    expect(calculateReadingTime(longContent)).toBe(2);
    
    // Test minimum reading time
    expect(calculateReadingTime('short')).toBe(1);
    expect(calculateReadingTime('')).toBe(1);
  });
  
  test('formatReadingTime should format correctly', () => {
    expect(formatReadingTime(1)).toBe('1 min read');
    expect(formatReadingTime(5)).toBe('5 min read');
    expect(formatReadingTime(10)).toBe('10 min read');
  });
  
  test('calculatePostReadingTime should handle HTML content', () => {
    const htmlContent = '<p>This is a test with <strong>some HTML</strong> tags.</p>';
    const result = calculatePostReadingTime('Title', htmlContent);
    expect(result).toBe(1); // Should be minimum 1 minute
  });
  
  test('reading time should handle real-world content', () => {
    const title = 'How to Build a Modern Web Application';
    const content = `
      <p>Building modern web applications requires understanding of various technologies and frameworks. 
      React, Next.js, and TypeScript have become popular choices for developers.</p>
      
      <p>In this comprehensive guide, we'll explore the fundamental concepts needed to create 
      scalable and maintainable web applications. We'll cover everything from project setup 
      to deployment strategies.</p>
      
      <p>The modern web development landscape is constantly evolving, with new tools and 
      best practices emerging regularly. Staying updated with these changes is crucial 
      for any developer looking to build high-quality applications.</p>
    `.repeat(10); // Simulate a longer article
    
    const result = calculatePostReadingTime(title, content);
    expect(result).toBeGreaterThan(3); // Should be more than 3 minutes for this content
  });
});