import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/site';

export const dynamic = 'force-static';

/** Nothing here is private; a Disallow would only risk hiding the menu. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
