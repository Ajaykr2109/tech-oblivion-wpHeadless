import React, { useEffect, useState } from 'react';

import { sanitizeWP } from '@/lib/sanitize';

interface CommentProps {
  comment: {
    author_name: string;
    content: {
      rendered: string;
    };
  };
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const [sanitizedContent, setSanitizedContent] = useState('');

  useEffect(() => {
    const sanitizeContent = async () => {
      try {
        const safe = await sanitizeWP(comment.content.rendered || '');
        setSanitizedContent(safe);
      } catch (error) {
        console.error('Failed to sanitize comment content:', error);
        // Fallback to empty content if sanitization fails
        setSanitizedContent('');
      }
    };

    sanitizeContent();
  }, [comment.content.rendered]);

  return (
    <div className="comment">
      <p><strong>{comment.author_name}</strong></p>
      <div 
        dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
        className="comment-content prose prose-sm dark:prose-invert max-w-none"
      />
    </div>
  );
};

export default Comment;