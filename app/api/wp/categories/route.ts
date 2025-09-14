// Define Next.js route config locally so it's recognized
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Re-export handlers from the shared implementation
export { GET, POST } from '../../../../src/app/api/wp/categories/route'