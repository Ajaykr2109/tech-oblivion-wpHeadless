import { notFound } from 'next/navigation'

export default function EditPostPage({ params }: { params: { id: string } }) {
  const { id } = params
  if (!id) notFound()
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-2">Editing Post #{id}</h1>
      <p className="text-sm text-muted-foreground">Inline editor coming soon. Use the Posts section editor tile for autosave/publish flow.</p>
    </div>
  )
}
