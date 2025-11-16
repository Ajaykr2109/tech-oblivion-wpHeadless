'use client'

import React from 'react'
import { ChevronUp, ChevronDown, Type, Bold, Italic, Link as LinkIcon, Code, Quote, List, ListOrdered, Image as ImageIcon, Bot, Save, Eye, SplitSquareHorizontal, Upload, Tag, Settings, Search as SearchIcon, BarChart3, PanelsTopLeft } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type RibbonProps = {
  collapsed: boolean
  onToggle(): void
  onCommand?: (cmd: string) => void
}

export function Ribbon({ collapsed, onToggle, onCommand }: RibbonProps) {
  const [tab, setTab] = React.useState('content')

  const IconBtn = ({ title, cmd, children }: { title: string; cmd: string; children: React.ReactNode }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="sm" onClick={() => onCommand?.(cmd)} className="h-8">
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent><p>{title}</p></TooltipContent>
    </Tooltip>
  )

  return (
    <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="container mx-auto px-3">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <PanelsTopLeft className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">Editor</span>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" onClick={onToggle} aria-label={collapsed ? 'Expand ribbon' : 'Collapse ribbon'}>
                    {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{collapsed ? 'Expand ribbon' : 'Collapse ribbon'}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        {!collapsed && (
          <div className="pb-2">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="content">Content Tools</TabsTrigger>
                <TabsTrigger value="seo">SEO Tools</TabsTrigger>
                <TabsTrigger value="publishing">Publishing</TabsTrigger>
                <TabsTrigger value="utils">Utilities</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="pt-2">
                <TooltipProvider>
                  <div className="flex flex-wrap gap-1">
                    <IconBtn title="Write" cmd="write"><Type className="h-4 w-4" /></IconBtn>
                    <IconBtn title="Bold" cmd="bold"><Bold className="h-4 w-4" /></IconBtn>
                    <IconBtn title="Italic" cmd="italic"><Italic className="h-4 w-4" /></IconBtn>
                    <IconBtn title="Link" cmd="link"><LinkIcon className="h-4 w-4" /></IconBtn>
                    <IconBtn title="Code" cmd="code"><Code className="h-4 w-4" /></IconBtn>
                    <IconBtn title="Quote" cmd="quote"><Quote className="h-4 w-4" /></IconBtn>
                    <IconBtn title="Bullet List" cmd="ul"><List className="h-4 w-4" /></IconBtn>
                    <IconBtn title="Numbered List" cmd="ol"><ListOrdered className="h-4 w-4" /></IconBtn>
                    <IconBtn title="Image" cmd="image"><ImageIcon className="h-4 w-4" /></IconBtn>
                    <div className="mx-2 w-px bg-border" />
                    <IconBtn title="Split" cmd="split"><SplitSquareHorizontal className="h-4 w-4" /></IconBtn>
                    <IconBtn title="Preview" cmd="preview"><Eye className="h-4 w-4" /></IconBtn>
                  </div>
                </TooltipProvider>
              </TabsContent>

              <TabsContent value="seo" className="pt-2">
                <TooltipProvider>
                  <div className="flex flex-wrap gap-1">
                    <IconBtn title="Search Preview" cmd="seo:preview"><BarChart3 className="h-4 w-4" /></IconBtn>
                    <IconBtn title="SEO Score" cmd="seo:score"><SearchIcon className="h-4 w-4" /></IconBtn>
                    <IconBtn title="SEO Metadata" cmd="seo:meta"><Tag className="h-4 w-4" /></IconBtn>
                    <IconBtn title="Content Analysis" cmd="seo:analysis"><Bot className="h-4 w-4" /></IconBtn>
                  </div>
                </TooltipProvider>
              </TabsContent>

              <TabsContent value="publishing" className="pt-2">
                <TooltipProvider>
                  <div className="flex flex-wrap gap-1">
                    <IconBtn title="Save Draft" cmd="publish:save"><Save className="h-4 w-4" /></IconBtn>
                    <IconBtn title="Status" cmd="publish:status"><Settings className="h-4 w-4" /></IconBtn>
                    <IconBtn title="Categories" cmd="publish:categories"><List className="h-4 w-4" /></IconBtn>
                    <IconBtn title="Tags" cmd="publish:tags"><Tag className="h-4 w-4" /></IconBtn>
                    <IconBtn title="Featured Image" cmd="publish:image"><Upload className="h-4 w-4" /></IconBtn>
                  </div>
                </TooltipProvider>
              </TabsContent>

              <TabsContent value="utils" className="pt-2">
                <TooltipProvider>
                  <div className="flex flex-wrap gap-1">
                    <IconBtn title="AI Writing Assistant" cmd="util:ai"><Bot className="h-4 w-4" /></IconBtn>
                    <IconBtn title="Find Internal Links" cmd="util:links"><LinkIcon className="h-4 w-4" /></IconBtn>
                    <IconBtn title="Content Analysis" cmd="util:analysis"><BarChart3 className="h-4 w-4" /></IconBtn>
                  </div>
                </TooltipProvider>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
