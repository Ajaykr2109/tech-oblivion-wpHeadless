'use client';

import React from 'react';
import { AlertCircle, CheckCircle, Target, Search } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SeoHintsProps {
  title: string;
  description: string;
  keyword: string;
  content: string;
}

export const SeoHints: React.FC<SeoHintsProps> = ({ title, description, keyword, content }) => {
  const titleLength = title.length;
  const descriptionLength = description.length;
  const keywordInContent = keyword && content.toLowerCase().includes(keyword.toLowerCase());
  
  const getTitleStatus = () => {
    if (titleLength === 0) return { icon: AlertCircle, color: 'text-red-500', message: 'Title is required' };
    if (titleLength < 30) return { icon: AlertCircle, color: 'text-yellow-500', message: 'Title too short (30-60 chars recommended)' };
    if (titleLength > 60) return { icon: AlertCircle, color: 'text-yellow-500', message: 'Title too long (30-60 chars recommended)' };
    return { icon: CheckCircle, color: 'text-green-500', message: 'Title length is optimal' };
  };
  
  const getDescriptionStatus = () => {
    if (descriptionLength === 0) return { icon: AlertCircle, color: 'text-red-500', message: 'Meta description is required' };
    if (descriptionLength < 120) return { icon: AlertCircle, color: 'text-yellow-500', message: 'Description too short (120-160 chars recommended)' };
    if (descriptionLength > 160) return { icon: AlertCircle, color: 'text-yellow-500', message: 'Description too long (120-160 chars recommended)' };
    return { icon: CheckCircle, color: 'text-green-500', message: 'Description length is optimal' };
  };
  
  const getKeywordStatus = () => {
    if (!keyword) return { icon: Target, color: 'text-gray-400', message: 'Add a focus keyword' };
    if (!keywordInContent) return { icon: AlertCircle, color: 'text-yellow-500', message: 'Focus keyword not found in content' };
    return { icon: CheckCircle, color: 'text-green-500', message: 'Focus keyword found in content' };
  };

  const titleStatus = getTitleStatus();
  const descriptionStatus = getDescriptionStatus();
  const keywordStatus = getKeywordStatus();

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">SEO Optimization</span>
        </div>
        
        <div className="space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <titleStatus.icon className={`h-3 w-3 ${titleStatus.color}`} />
                <span className="text-xs text-muted-foreground">Title ({titleLength}/60)</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{titleStatus.message}</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <descriptionStatus.icon className={`h-3 w-3 ${descriptionStatus.color}`} />
                <span className="text-xs text-muted-foreground">Description ({descriptionLength}/160)</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{descriptionStatus.message}</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <keywordStatus.icon className={`h-3 w-3 ${keywordStatus.color}`} />
                <span className="text-xs text-muted-foreground">
                  {keyword ? `Keyword: ${keyword}` : 'No focus keyword'}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{keywordStatus.message}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};