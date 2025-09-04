'use client';

import { MoreVertical, Edit, Share, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { canEditPost } from '@/lib/permissions';
import type { User } from '@/lib/auth';

interface Post {
  id: number;
  author_id?: number;
  author?: {
    id: number;
    slug?: string;
  };
  title?: string;
  slug?: string;
}

interface PostActionsMenuProps {
  post: Post;
  user?: User | null;
  editUrl?: string; // Custom edit URL if different from /editor/${post.id}
  className?: string;
}

export function PostActionsMenu({ post, user, editUrl, className }: PostActionsMenuProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const canEdit = canEditPost(user || null, post);
  const postEditUrl = editUrl || `/editor/${post.id}`;
  const canonicalUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = async () => {
    setIsOpen(false);
    
    // Try Web Share API first (mobile/modern browsers)
    if (navigator.share && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: post.title || 'Check out this post',
          url: canonicalUrl,
        });
        return;
      } catch {
        // User cancelled or API not available, fall back to other methods
      }
    }
    
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      toast({
        title: 'Link copied!',
        description: 'Post URL has been copied to your clipboard.',
      });
    } catch {
      // Final fallback: show a prompt with the URL
      toast({
        title: 'Share this post',
        description: canonicalUrl,
        duration: 5000,
      });
    }
  };

  const handleCopyLink = async () => {
    setIsOpen(false);
    
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      toast({
        title: 'Link copied!',
        description: 'Post URL has been copied to your clipboard.',
      });
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = canonicalUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast({
          title: 'Link copied!',
          description: 'Post URL has been copied to your clipboard.',
        });
      } catch {
        toast({
          title: 'Copy failed',
          description: 'Unable to copy link to clipboard.',
          variant: 'destructive',
        });
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${className || ''}`}
          aria-label="Post actions"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Edit - only show if user can edit */}
        {canEdit && (
          <DropdownMenuItem asChild>
            <a href={postEditUrl} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Post
            </a>
          </DropdownMenuItem>
        )}
        
        {/* Share */}
        <DropdownMenuItem onClick={handleShare} className="flex items-center gap-2">
          <Share className="h-4 w-4" />
          Share
        </DropdownMenuItem>
        
        {/* Copy Link */}
        <DropdownMenuItem onClick={handleCopyLink} className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          Copy Link
        </DropdownMenuItem>
        
        {/* View in new tab */}
        <DropdownMenuItem asChild>
          <a 
            href={canonicalUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open in New Tab
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default PostActionsMenu;
