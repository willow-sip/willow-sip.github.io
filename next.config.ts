import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    workerThreads: false,
    cpus: 1,
  },

  images: {
    unoptimized: true,
  },
  
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    resolveAlias: {
      'next/image': ('@components/StaticImage.tsx'),
    },
  },
};

export default nextConfig;
