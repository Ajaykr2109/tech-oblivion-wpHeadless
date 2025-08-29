import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold mb-4">Page not found</h1>
      <p className="text-muted-foreground mb-8">The page you’re looking for doesn’t exist.</p>
      <Link href="/" className="bg-primary text-primary-foreground px-4 py-2 rounded">Back to Home</Link>
    </div>
  )
}
