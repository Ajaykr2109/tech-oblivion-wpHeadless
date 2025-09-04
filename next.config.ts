import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
      // Existing editor redirects (keep)
      { source: '/editor/new', destination: '/editor/new', permanent: false },
      { source: '/editor/:id', destination: '/editor/:id', permanent: false },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'techoblivion.in',
        port: '',
        pathname: '/**',
      },
  { protocol: 'https', hostname: 'secure.gravatar.com', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'www.gravatar.com', port: '', pathname: '/**' },
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
