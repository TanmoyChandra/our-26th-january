import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Vercel / Production settings ─────────────────────────────────────────

  // Compress responses (Vercel does this at the edge, but keep as fallback)
  compress: true,

  // Strict mode for catching React issues early
  reactStrictMode: true,

  // Image optimisation — Vercel provides this natively via its Image CDN.
  // Allow Vercel's optimised image domains if remote images are added later.
  images: {
    formats: ["image/avif", "image/webp"],
    // Add remote patterns here when real imagery is introduced in Phase 2:
    // remotePatterns: [{ protocol: 'https', hostname: 'example.com' }],
  },

  // Turbopack config — only used by `next dev --turbopack` locally.
  // Vercel production builds use webpack; this block is ignored there.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // Security headers — applied on every response via Vercel Edge Network.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent embedding in iframes (clickjacking protection)
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Only send referrer to same origin
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions policy — disable unused browser APIs
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Cache public media assets (images, fonts, audio, video).
        // Vercel automatically sets immutable Cache-Control on /_next/static,
        // so we only add headers for our own public/ assets here.
        source: "/(images|fonts|audio|videos)/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
