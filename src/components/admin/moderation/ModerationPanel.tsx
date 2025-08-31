"use client"
import { useState } from 'react'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

type Item = { id: number; title: string; status: 'pending'|'flagged'|'banned' }

export default function ModerationPanel() {
  const [pendingPosts] = useState<Item[]>([
    { id: 1, title: 'Pending draft: AI Trends', status: 'pending' },
  ])
  const [flaggedContent] = useState<Item[]>([
    { id: 2, title: 'Comment ID 4829', status: 'flagged' },
  ])
  const [userBans] = useState<Item[]>([
    { id: 3, title: 'user: spammer42', status: 'banned' },
  ])

  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="posts">
          <AccordionTrigger>Pending posts</AccordionTrigger>
          <AccordionContent>
            <Card className="p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-1">ID</th>
                    <th className="py-1">Title</th>
                    <th className="py-1">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPosts.map(p => (
                    <tr key={p.id} className="border-t">
                      <td className="py-2">{p.id}</td>
                      <td className="py-2">{p.title}</td>
                      <td className="py-2"><Badge variant="secondary">{p.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="flagged">
          <AccordionTrigger>Flagged content</AccordionTrigger>
          <AccordionContent>
            <Card className="p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-1">ID</th>
                    <th className="py-1">Item</th>
                    <th className="py-1">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedContent.map(p => (
                    <tr key={p.id} className="border-t">
                      <td className="py-2">{p.id}</td>
                      <td className="py-2">{p.title}</td>
                      <td className="py-2"><Badge variant="destructive">{p.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="bans">
          <AccordionTrigger>User bans</AccordionTrigger>
          <AccordionContent>
            <Card className="p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-1">ID</th>
                    <th className="py-1">User</th>
                    <th className="py-1">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userBans.map(p => (
                    <tr key={p.id} className="border-t">
                      <td className="py-2">{p.id}</td>
                      <td className="py-2">{p.title}</td>
                      <td className="py-2"><Badge variant="outline">{p.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
