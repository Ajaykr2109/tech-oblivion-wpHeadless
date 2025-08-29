export default async function EditorEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl font-bold mb-4">Edit Post #{id}</h1>
      <p className="text-muted-foreground">Editor UI for existing post goes here.</p>
    </div>
  )
}
