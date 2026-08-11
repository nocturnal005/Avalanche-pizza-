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
  "form-action 'none'",
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
    // Capped at the master width (512px). Never request an upscale — see
    // docs/ARCHITECTURE.md 6.2.
    deviceSizes: [256, 384, 512],
    imageSizes: [64, 96, 128, 192],
    qualities: [50, 62],
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
