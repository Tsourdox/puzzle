import { NextConfig } from 'next';
import path from 'path';

const rootPath = path.join(__dirname, '..');

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      { hostname: 'images.pexels.com' },
      { hostname: 'wupuhaalpiroswvyhucu.supabase.co' },
    ],
  },
  outputFileTracingRoot: rootPath,
  turbopack: {
    root: rootPath,
  },
};

module.exports = nextConfig;
