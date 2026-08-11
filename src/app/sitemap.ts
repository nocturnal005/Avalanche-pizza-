import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const lastModified = new Date();

  return [
    { url: `${base}/`, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/menu`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/deals`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/about`, lastModified, changeFrequency: 'yearly', priority: 0.6 },
  ];
}
