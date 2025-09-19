import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { getSettings } from '@/lib/settings'
import Footer from '@/components/Footer';
import { ReactQueryProvider } from '@/components/providers/react-query'
import SiteTracking from '@/components/site-tracking';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Note: We use generateMetadata for dynamic site settings; avoid exporting both metadata and generateMetadata.

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const _settings = await getSettings()
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteTracking />
          <div className="flex min-h-screen flex-col">
            {/* Skip link for keyboard users */}
            <a href="#main-content" className="skip-link">Skip to content</a>
            <Header />
            <ReactQueryProvider>
              <main id="main-content" className="flex-grow">{children}</main>
            </ReactQueryProvider>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  // Helpers
  const toAbsoluteBase = (s?: string) => {
    const v = (s || '').trim()
    if (!v) return 'http://localhost:3000'
    if (/^https?:\/\//i.test(v)) return v
    return `https://${v.replace(/^\/+/, '')}`
  }
  const rewriteIfWP = (url?: string) => {
    if (!url) return url
    const WP = process.env.WP_URL || ''
    if (!WP) return url
    try {
      const u = new URL(url)
      if (u.host === new URL(WP).host) {
        return `/api/wp/media${u.pathname}${u.search}`
      }
      return url
    } catch {
      return url
    }
  }

  const envBase = toAbsoluteBase(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL)
  try {
    const settings = await getSettings()
    const base = toAbsoluteBase(settings.siteUrl || envBase)
    const title = settings.siteTitle || 'Tech Oblivion'
    const description = settings.defaultDescription || 'Technology with purpose'
    const ogImage = rewriteIfWP(settings.defaultOgImage || undefined)
    const twImage = rewriteIfWP(settings.defaultTwitterImage || ogImage || undefined)

    return {
      title,
      description,
      metadataBase: new URL(base),
      openGraph: {
        type: 'website',
        title,
        description,
        url: base,
        images: ogImage ? [ogImage] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: twImage ? [twImage] : undefined,
      },
    }
  } catch {
    // Ensure metadataBase is still set to avoid localhost warnings elsewhere.
    return {
      metadataBase: new URL(envBase),
    }
  }
}
