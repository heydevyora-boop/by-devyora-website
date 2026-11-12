import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // pg (and the Prisma adapter wrapping it) use Node-native networking code
  // that shouldn't be run through Next's bundler — required as of Prisma 7's
  // driver-adapter architecture (see lib/prisma.ts).
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],

  // Don't leak "X-Powered-By: Next.js" — no functional benefit to shipping it.
  poweredByHeader: false,

  // gzip/brotli compression for the Node runtime; a no-op (and harmless) on
  // Vercel, which compresses at the edge regardless — kept for portability
  // if this ever runs on a different host.
  compress: true,

  images: {
    remotePatterns: [
      // Cloudinary — all media uploaded through the admin library
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Unsplash — only used by the seed data's stand-in imagery
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // AVIF first (smallest), WebP fallback — matches the f_auto behavior
    // Cloudinary already does for CloudinaryImage, applied here for the rare
    // next/image usage that isn't going through the Cloudinary loader.
    formats: ["image/avif", "image/webp"],
  },

  // Surfaces type errors as build failures rather than silently shipping —
  // remove only if you have a specific reason to bypass typechecking on deploy.
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
