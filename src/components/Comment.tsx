import React from 'react';

interface CommentProps {
  comment: {
    author_name: string;
    content: {
      rendered: string;
    };
  };
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  return (
    <div className="comment">
      <p><strong>{comment.author_name}</strong></p>
      <div dangerouslySetInnerHTML={{ __html: comment.content.rendered }} />
    </div>
  );
};

export default Comment;