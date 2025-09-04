import { notFound } from 'next/navigation'

import { AuthorProfileView } from '@/components/author/AuthorProfileView'

interface AuthorPageProps {
  params: {
    slug: string
  }
}

async function getAuthorData(slug: string) {
  try {
    const wpUrl = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL
    if (!wpUrl) throw new Error('WordPress URL not configured')

    // Fetch author data
    const authorResponse = await fetch(
      `${wpUrl}/wp-json/wp/v2/users?slug=${encodeURIComponent(slug)}`,
      { cache: 'no-store' }
    )
    
    if (!authorResponse.ok) {
      return null
    }
    
    const authors = await authorResponse.json()
    const author = authors[0]
    
    if (!author) {
      return null
    }

    // Fetch posts by this author (only if they have author role or higher)
    let posts = []
    if (author.roles && (
      author.roles.includes('author') || 
      author.roles.includes('editor') || 
      author.roles.includes('administrator')
    )) {
      const postsResponse = await fetch(
        `${wpUrl}/wp-json/wp/v2/posts?author=${author.id}&status=publish&per_page=20`,
        { cache: 'no-store' }
      )
      
      if (postsResponse.ok) {
        posts = await postsResponse.json()
      }
    }

    // Fetch comments made by this user
    const commentsResponse = await fetch(
      `${wpUrl}/wp-json/wp/v2/comments?author_email=${encodeURIComponent(author.email)}&per_page=10`,
      { cache: 'no-store' }
    )
    
    const comments = commentsResponse.ok ? await commentsResponse.json() : []

    return {
      author,
      posts,
      comments
    }
  } catch (error) {
    console.error('Error fetching author data:', error)
    return null
  }
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = params
  const data = await getAuthorData(slug)
  
  if (!data) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AuthorProfileView 
        author={data.author}
        posts={data.posts}
        comments={data.comments}
      />
    </div>
  )
}

export async function generateMetadata({ params }: AuthorPageProps) {
  const { slug } = params
  const data = await getAuthorData(slug)
  
  if (!data) {
    return {
      title: 'Author Not Found'
    }
  }

  const { author } = data
  const displayName = author.name || author.display_name || author.slug
  
  return {
    title: `${displayName} - Author Profile`,
    description: author.description || `View posts and profile information for ${displayName}`,
  }
}
