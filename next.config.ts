import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  assetPrefix: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rsbjjbiwpmmzjcemjeyf.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Add a more generic pattern for any Supabase project
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
