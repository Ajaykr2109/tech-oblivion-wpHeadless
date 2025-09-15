'use client';

import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ZenModeToggleProps {
  isZenMode: boolean;
  onToggle: () => void;
  iconOnly?: boolean;
}

export const ZenModeToggle: React.FC<ZenModeToggleProps> = ({ isZenMode, onToggle, iconOnly = false }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            className="flex items-center gap-2 zen-mode-toggle"
          >
            {isZenMode ? (
              <>
                <Minimize2 className="h-4 w-4" />
                {!iconOnly && <span className="hidden sm:inline">Exit Zen</span>}
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                {!iconOnly && <span className="hidden sm:inline">Zen Mode</span>}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isZenMode ? 'Exit full-width writing mode' : 'Enter distraction-free writing mode'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};