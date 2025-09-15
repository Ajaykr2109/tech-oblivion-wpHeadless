import { AlertTriangle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface DummyDataIndicatorProps {
  type?: 'dot' | 'badge' | 'banner'
  message?: string
  className?: string
}

export function DummyDataIndicator({ 
  type = 'badge', 
  message = 'This section contains dummy/placeholder data',
  className = ''
}: DummyDataIndicatorProps) {
  if (type === 'dot') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span 
              className={`inline-block w-2 h-2 bg-red-500 rounded-full ${className}`}
              aria-label={message}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>{message}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (type === 'badge') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`bg-red-50 border-red-200 text-red-700 text-xs ${className}`}>
              <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5" />
              Demo Data
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{message}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (type === 'banner') {
    return (
      <div className={`bg-red-50 border-l-4 border-red-400 p-4 mb-6 ${className}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <strong>Demo Mode:</strong> {message}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default DummyDataIndicator