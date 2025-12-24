import { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { hostname: 'images.pexels.com' },
      { hostname: 'wupuhaalpiroswvyhucu.supabase.co' },
    ],
  },
  turbopack: {
    root: path.join(__dirname, '..'),
  },
};

module.exports = nextConfig;
