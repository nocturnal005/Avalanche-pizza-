/**
 * The canonical origin.
 *
 * Production sets NEXT_PUBLIC_SITE_URL. Preview deployments fall back to the
 * Vercel-injected host so their metadata is self-referencing rather than
 * pointing at production; local dev falls back to localhost. This is the only
 * environment variable the application reads.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return 'http://localhost:3000';
}

/** Absolute URL for a site-relative path — required by the WhatsApp crawler. */
export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}
