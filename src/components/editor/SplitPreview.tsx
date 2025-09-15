'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Split } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SplitPreviewProps {
  content: string;
  className?: string;
}

export const SplitPreview: React.FC<SplitPreviewProps> = ({ content, className = '' }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);

  if (!showPreview) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Show markdown preview</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSplitView(!isSplitView)}
              >
                <Split className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isSplitView ? 'Stack view' : 'Split view'}</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Hide preview</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {isSplitView ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="order-2 xl:order-1">
            <h3 className="text-sm font-medium mb-2">Markdown</h3>
            <div className="border rounded-lg p-4 bg-muted/50 max-h-96 overflow-y-auto preview-area">
              <pre className="text-sm whitespace-pre-wrap font-mono">{content}</pre>
            </div>
          </div>
          <div className="order-1 xl:order-2">
            <h3 className="text-sm font-medium mb-2">Preview</h3>
            <div className="border rounded-lg p-4 bg-background max-h-96 overflow-y-auto prose prose-sm dark:prose-invert max-w-none preview-area">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-sm font-medium mb-2">Preview</h3>
          <div className="border rounded-lg p-4 bg-background max-h-96 overflow-y-auto prose prose-sm dark:prose-invert max-w-none preview-area">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};