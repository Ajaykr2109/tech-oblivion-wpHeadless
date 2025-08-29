import React from 'react'

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Tag: {slug}</h1>
      <p className="text-muted-foreground">Posts with this tag will show here.</p>
    </div>
  )
}
