"use client";
import Head from 'next/head';

type SEOProps = {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  twitterImage?: string;
  schema?: object;
};

export default function SEO({
  title,
  description,
  canonical,
  ogImage,
  twitterImage,
  schema,
}: SEOProps) {
  return (
    <Head>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}

      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}

      {/* Twitter */}
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}    
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}

      {/* Structured Data */}
      {schema && (
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          type="application/ld+json"
        />
      )}
    </Head>
  );
}
