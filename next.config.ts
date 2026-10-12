import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // A package-lock.json above this folder would otherwise be picked as the workspace root.
  turbopack: { root: process.cwd() },
};

export default nextConfig;
