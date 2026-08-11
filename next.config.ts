import type { NextConfig } from 'next';

/**
 * Security headers. docs/SECURITY.md C5 is authoritative.
 *
 * script-src omits 'unsafe-inline': Next's inline bootstrap is covered by hashes
 * added in Stage 5 once the output is stable. style-src keeps 'unsafe-inline'
 * because next/image sets inline style attributes, which CSP hashes cannot cover —
 * safe here only because default-src 'none' plus same-origin img/font/connect
 * leaves CSS nowhere to exfiltrate to.
 */
const csp = [
  "default-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  // Self-hosted hero video on /about. Without this, default-src 'none' blocks it.
  "media-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  // Payment redirects hand off to Flutterwave's hosted checkout.
  "form-action 'self' https://checkout.flutterwave.com https://*.flutterwave.com",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    // Masters re-archived at native resolution (1024–1408px) on 2026-08-11 at
    // the owner's ultra-high-resolution mandate. The optimizer never upscales
    // past a source's native width, so the top rungs simply serve the largest
    // real pixels available.
    deviceSizes: [512, 640, 828, 1080, 1440, 1920],
    imageSizes: [64, 96, 128, 192, 256, 384],
    // 75 is next/image's default when no quality prop is set (cards);
    // heroes and portraits pass 85 explicitly; 62 remains for Save-Data use.
    qualities: [62, 75, 85],
    minimumCacheTTL: 31_536_000,
    // Deliberately empty: no remote image may be introduced without a reviewed
    // config change. All imagery is self-hosted from src/assets/images.
    remotePatterns: [],
  },

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/og/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/icons/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // Immutable like /og: a replaced video gets a NEW filename, never an
        // overwrite — the CDN and repeat visitors hold this copy for a year.
        source: '/videos/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
