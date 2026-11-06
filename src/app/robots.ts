import type { MetadataRoute } from 'next'
import { absoluteURL, getServerURL } from '@/lib/url'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/contact.php'] }],
    sitemap: absoluteURL('/sitemap.xml'),
    host: new URL(getServerURL()).host,
  }
}
