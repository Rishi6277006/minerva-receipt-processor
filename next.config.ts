import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ignore TypeScript and ESLint errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
