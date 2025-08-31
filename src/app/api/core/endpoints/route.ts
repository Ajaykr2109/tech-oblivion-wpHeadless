export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Endpoint = { method: string; route: string }

const endpoints: Endpoint[] = [
  { method: 'GET', route: '/api/_debug' },
  { method: 'GET', route: '/api/test' },
  { method: 'GET', route: '/api/wp/posts' },
  { method: 'POST', route: '/api/wp/posts' },
  { method: 'PATCH', route: '/api/wp/posts?id={id}' },
  { method: 'DELETE', route: '/api/wp/posts?id={id}' },
  { method: 'GET', route: '/api/wp/comments' },
  { method: 'POST', route: '/api/wp/comments' },
  { method: 'GET', route: '/api/wp/categories' },
  { method: 'POST', route: '/api/wp/categories' },
  { method: 'GET', route: '/api/wp/tags' },
  { method: 'POST', route: '/api/wp/tags' },
  { method: 'GET', route: '/api/metrics/layout?section={section}' },
  { method: 'POST', route: '/api/metrics/layout' },
]

export async function GET() {
  return Response.json(endpoints)
}
