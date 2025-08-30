// Utility functions to generate JSON-LD schemas for SEO

export function getArticleSchema(post: any) {
  const slug = post.slug || post?.seo?.slug || post?.uri?.replace(/^\/?blog\//, '') || '';
  const title = post.title?.rendered || post.title || '';
  const description = (post.excerpt?.rendered || post.excerpt || '').replace(/<[^>]+>/g, "");
  const image = post.featuredImage?.node?.sourceUrl || post.featuredImage || "https://techoblivion.in/default-cover.jpg";
  const authorName = post.author?.node?.name || post.authorName || "tech.oblivion";
  const datePublished = post.date || post.publishedAt || undefined;
  const dateModified = post.modified || post.updatedAt || datePublished;
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

export function getBreadcrumbSchema(post: any) {
  const slug = post.slug || post?.seo?.slug || post?.uri?.replace(/^\/?blog\//, '') || '';
  const title = post.title?.rendered || post.title || '';
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

export function getFAQSchema(faqs: any[]) {
  if (!faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function getVideoSchema({ post, videoId, uploadDate }: { post: any, videoId: string, uploadDate: string }) {
  if (!videoId) return null;
  const title = post.title?.rendered || post.title || '';
  const description = (post.excerpt?.rendered || post.excerpt || '').replace(/<[^>]+>/g, "");
  const image = post.featuredImage?.node?.sourceUrl || post.featuredImage || "https://techoblivion.in/default-cover.jpg";
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
