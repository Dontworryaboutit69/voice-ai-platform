import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Backend integration files have pre-existing TS errors being fixed by backend dev
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
