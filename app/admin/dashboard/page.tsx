import { Suspense } from 'react'
import UnifiedAdmin from '@/components/admin/UnifiedAdmin'
import Link from 'next/link'
import SectionRenderer from '@/components/dashboard/SectionRenderer'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export const runtime = 'nodejs'

export default async function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <div className="mb-4 text-sm text-muted-foreground">
        Looking for the new unified, draggable dashboard? See <Link className="underline" href="/dashboard/full">Dashboard Full</Link>.
      </div>
      <div className="mt-4">
        <Tabs defaultValue="Dashboard">
          <TabsList className="flex flex-wrap gap-2">
            {['Dashboard','Analytics','Posts','Media','Users','Settings','Plugins','Themes','Site Health','Debug/Test'].map(s => (
              <TabsTrigger key={s} value={s as any}>{s}</TabsTrigger>
            ))}
          </TabsList>
          {(['Dashboard','Analytics','Posts','Media','Users','Settings','Plugins','Themes','Site Health','Debug/Test'] as const).map(s => (
            <TabsContent key={s} value={s as any}>
              <Suspense fallback={<div>Loading…</div>}>
                <SectionRenderer section={s} />
              </Suspense>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
