import type { MetadataRoute } from 'next'
import { getSitemapEntries } from '@/lib/queries'
import { absoluteURL } from '@/lib/url'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { pages, posts, services, products } = await getSitemapEntries()
  const latest = (items: { updatedAt: string }[]) =>
    items.reduce<string | undefined>((max, i) => (!max || i.updatedAt > max ? i.updatedAt : max), undefined)

  return [
    { url: absoluteURL('/'), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteURL('/about'), changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteURL('/products'), lastModified: latest(products), changeFrequency: 'monthly', priority: 0.9 },
    ...products.map((p) => ({
      url: absoluteURL(`/products/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: absoluteURL('/tools'), changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteURL('/contact'), changeFrequency: 'yearly', priority: 0.7 },
    { url: absoluteURL('/services'), lastModified: latest(services), changeFrequency: 'monthly', priority: 0.8 },
    ...services.map((s) => ({
      url: absoluteURL(`/services/${s.slug}`),
      lastModified: s.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: absoluteURL('/blog'), lastModified: latest(posts), changeFrequency: 'weekly', priority: 0.8 },
    ...posts.map((p) => ({
      url: absoluteURL(`/blog/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...pages.map((p) => ({
      url: absoluteURL(`/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    })),
  ]
}
