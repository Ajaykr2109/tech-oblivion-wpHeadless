'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bold, Italic, Link as LinkIcon, Code, Type, Strikethrough } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FloatingToolbarProps {
  onFormat: (type: string) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ onFormat, textareaRef }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  
  // Ensure this only runs on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const handleSelection = () => {
      const textarea = textareaRef?.current || document.getElementById('content') as HTMLTextAreaElement;
      
      if (!textarea) {
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const hasSelection = start !== end;

      if (hasSelection) {
        // Calculate position based on textarea position and selection
        const textareaRect = textarea.getBoundingClientRect();
        const scrollTop = window.pageYOffset;
        const scrollLeft = window.pageXOffset;
        
        // Estimate line height and cursor position
        const style = window.getComputedStyle(textarea);
        const lineHeight = parseInt(style.lineHeight) || parseInt(style.fontSize) * 1.2;
        
        // Get text up to selection start to estimate position
        const textBeforeSelection = textarea.value.substring(0, start);
        const linesBeforeSelection = textBeforeSelection.split('\n').length - 1;
        
        // Calculate position
        const top = textareaRect.top + scrollTop + (linesBeforeSelection * lineHeight) - 60;
        const left = textareaRect.left + scrollLeft + (textareaRect.width / 2);
        
        setPosition({ top, left });
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const handleSelectionChange = () => {
      setTimeout(handleSelection, 0); // Delay to ensure selection is updated
    };

    const handleMouseUp = () => {
      setTimeout(handleSelection, 0);
    };
    
    const handleKeyUp = () => {
      setTimeout(handleSelection, 0);
    };

    // Add event listeners
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp);
    
    // Add textarea-specific listeners if we have a ref
    const textarea = textareaRef?.current || document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      textarea.addEventListener('select', handleSelection);
      textarea.addEventListener('mouseup', handleSelection);
      textarea.addEventListener('keyup', handleSelection);
    }
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleKeyUp);
      
      // Remove textarea-specific listeners
      if (textarea) {
        textarea.removeEventListener('select', handleSelection);
        textarea.removeEventListener('mouseup', handleSelection);
        textarea.removeEventListener('keyup', handleSelection);
      }
    };
  }, [textareaRef, mounted]);

  // Don't render anything until component is mounted on client
  if (!mounted) {
    return null;
  }
  
  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-background/95 backdrop-blur border rounded-lg shadow-lg p-1 flex items-center gap-0.5 transition-all duration-200 animate-in fade-in-0 zoom-in-95 floating-toolbar"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
      }}
    >      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onFormat('bold')}
            >
              <Bold className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Bold</p></TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onFormat('italic')}
            >
              <Italic className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Italic</p></TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onFormat('strikethrough')}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Strikethrough</p></TooltipContent>
        </Tooltip>
        
        <div className="w-px h-4 bg-border mx-1" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onFormat('heading')}
            >
              <Type className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Heading</p></TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onFormat('link')}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Link</p></TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onFormat('code')}
            >
              <Code className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Code</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};