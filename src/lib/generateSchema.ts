// Utility functions to generate JSON-LD schemas for SEO
// Accepts a post-like object; we normalize safely inside

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function getSlug(post: unknown): string {
  if (isObj(post) && 'slug' in post && typeof (post as Record<string, unknown>).slug === 'string') return (post as Record<string, unknown>).slug as string
  const seo = (post as Record<string, unknown>).seo
  if (seo && typeof (seo as Record<string, unknown>).slug === 'string') return (seo as Record<string, unknown>).slug as string
  const uri = (post as Record<string, unknown>).uri
  if (typeof uri === 'string') return uri.replace(/^\/\?blog\//, '')
  return ''
}

function getTitle(post: unknown): string {
  const t = (post as Record<string, unknown>).title
  if (typeof t === 'string') return t
  if (t && typeof (t as Record<string, unknown>).rendered === 'string') return (t as Record<string, unknown>).rendered as string
  return ''
}

function getExcerpt(post: unknown): string {
  const e = (post as Record<string, unknown>).excerpt
  if (typeof e === 'string') return e
  if (e && typeof (e as Record<string, unknown>).rendered === 'string') return (e as Record<string, unknown>).rendered as string
  return ''
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]+>/g, '')
}

function getImage(post: unknown): string {
  const fi = (post as Record<string, unknown>).featuredImage
  if (typeof fi === 'string') return fi
  if (isObj(fi) && 'node' in fi && isObj(fi.node) && 'sourceUrl' in fi.node) {
    const nested = fi.node.sourceUrl
    if (typeof nested === 'string') return nested
  }
  return 'https://techoblivion.in/default-cover.jpg'
}

function getAuthorName(post: unknown): string {
  const authorName = (post as Record<string, unknown>).authorName
  if (typeof authorName === 'string' && authorName) return authorName
  const author = (post as Record<string, unknown>).author
  if (isObj(author) && 'node' in author && isObj(author.node) && 'name' in author.node) {
    const name = author.node.name
    if (typeof name === 'string' && name) return name
  }
  return 'tech.oblivion'
}

function getDatePublished(post: unknown): string | undefined {
  if (isObj(post) && 'date' in post && typeof (post as Record<string, unknown>).date === 'string') return (post as Record<string, unknown>).date as string
  const publishedAt = (post as Record<string, unknown>).publishedAt
  if (typeof publishedAt === 'string') return publishedAt
  return undefined
}

function getDateModified(post: unknown): string | undefined {
  const modified = (post as Record<string, unknown>).modified
  if (typeof modified === 'string') return modified
  const updatedAt = (post as Record<string, unknown>).updatedAt
  if (typeof updatedAt === 'string') return updatedAt
  return getDatePublished(post)
}

export function getArticleSchema(post: unknown): Record<string, unknown> {
  const slug = getSlug(post);
  const title = getTitle(post);
  const description = stripHtml(getExcerpt(post));
  const image = getImage(post);
  const authorName = getAuthorName(post);
  const datePublished = getDatePublished(post);
  const dateModified = getDateModified(post);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://techoblivion.in/blog/${slug}`
    },
    "headline": title,
    "description": description,
    "image": image,
    "author": {
      "@type": "Person",
      "name": authorName
    },
    "publisher": {
      "@type": "Organization",
      "name": "tech.oblivion",
      "logo": {
        "@type": "ImageObject",
        "url": "https://techoblivion.in/logo.png"
      }
    },
    "datePublished": datePublished,
    "dateModified": dateModified
  };
}

export function getBreadcrumbSchema(post: unknown): Record<string, unknown> {
  const slug = getSlug(post);
  const title = getTitle(post);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://techoblivion.in/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://techoblivion.in/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": title,
        "item": `https://techoblivion.in/blog/${slug}`
      }
    ]
  };
}

interface FAQ {
  question: string
  answer: string
}

export function getFAQSchema(faqs: FAQ[]) {
  if (!faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq: FAQ) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function getVideoSchema({ post, videoId, uploadDate }: { post: unknown, videoId: string, uploadDate: string }) {
  if (!videoId) return null;
  const title = getTitle(post);
  const description = stripHtml(getExcerpt(post));
  const image = getImage(post);
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": title,
    "description": description,
    "thumbnailUrl": image,
    "uploadDate": uploadDate,
    "contentUrl": `https://www.youtube.com/watch?v=${videoId}`,
    "embedUrl": `https://www.youtube.com/embed/${videoId}`,
    "publisher": {
      "@type": "Organization",
      "name": "tech.oblivion",
      "logo": {
        "@type": "ImageObject",
        "url": "https://techoblivion.in/logo.png"
      }
    }
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://techoblivion.in/",
    "name": "tech.oblivion",
    "publisher": {
      "@type": "Organization",
      "name": "tech.oblivion",
      "logo": {
        "@type": "ImageObject",
        "url": "https://techoblivion.in/logo.png"
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://techoblivion.in/?s={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
}
