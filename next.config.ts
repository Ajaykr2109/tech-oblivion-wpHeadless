import type {NextConfig} from 'next';

const isDev = process.env.NODE_ENV !== 'production'

const nextConfig: NextConfig = {
  /* config options here */
  // Build a Node server output (not static export) because the app uses API routes
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      // Profile route consolidation - redirect duplicates to canonical /author/[slug]
      {
        source: '/user/:slug',
        destination: '/author/:slug',
        permanent: false // 308 temporary redirect
      },
      {
        source: '/wp/users/:slug', 
        destination: '/author/:slug',
        permanent: false
      },
      // Blog routing consolidation
      {
        source: '/blogs/:path*',
        destination: '/blog/:path*',
        permanent: false
      },
      // Remove circular editor redirects - they cause redirect loops
    ]
  },
  images: {
    // In local/dev, avoid Next image optimizer fetching remote images (which can be blocked by hotlink protection);
    // fall back to the browser loading them directly. You can force-enable via NEXT_IMAGE_UNOPTIMIZED=1
    unoptimized: isDev || process.env.NEXT_IMAGE_UNOPTIMIZED === '1',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'techoblivion.in',
        port: '',
        pathname: '/**',
      },
      // Allow non-HTTPS images if upstream is misconfigured during dev
      { protocol: 'http', hostname: 'techoblivion.in', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'secure.gravatar.com', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'www.gravatar.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '0.gravatar.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '1.gravatar.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '2.gravatar.com', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 's.w.org', port: '', pathname: '/**' },
      {
        protocol: 'https',
        hostname: 'i0.wp.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i1.wp.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i2.wp.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Note: allowedDevOrigins is a future/experimental setting; omit to avoid invalid config in this Next version.
};

export default nextConfig;
