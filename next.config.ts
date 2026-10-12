import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      { hostname: 'images.pexels.com' },
      { hostname: 'wupuhaalpiroswvyhucu.supabase.co' },
    ],
  },
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
