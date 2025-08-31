import { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: 'images.pexels.com' }],
  },
  turbopack: {
    root: path.join(__dirname, '..'),
  },
};

module.exports = nextConfig;
