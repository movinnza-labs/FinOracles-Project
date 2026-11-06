import type { MetadataRoute } from 'next'
import { absoluteURL, getServerURL } from '@/lib/url'

export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/preview', '/healthz'] }],
    sitemap: absoluteURL('/sitemap.xml'),
    host: new URL(getServerURL()).host,
  }
}
