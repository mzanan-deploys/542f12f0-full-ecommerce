import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: false,
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
    optimizePackageImports: [
      'react-icons',
      'motion',
      'lucide-react',
      'embla-carousel-react',
      'date-fns',
    ],
  },
};

export default nextConfig;