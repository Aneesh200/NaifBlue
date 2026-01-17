import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript type checking during builds
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'placehold.co', 
      'images.unsplash.com', 
      'yaxrnjazcknzqgnpwfuw.supabase.co',  // Current Supabase project
      'gdtfkvmdsmxvgoljgsia.supabase.co'   // Old Supabase project (for existing images)
    ],
  },
  // Allow external scripts for payment gateways
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://checkout.razorpay.com https://api.razorpay.com wss://*.supabase.co",
              "frame-src 'self' https://api.razorpay.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
