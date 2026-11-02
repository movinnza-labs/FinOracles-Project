import type { Metadata } from 'next'
import type { SiteSetting } from '@/payload-types'
import { getImage } from './media'
import { absoluteURL } from './url'

type MetaFields = {
  title?: string | null
  description?: string | null
  image?: unknown
  canonicalURL?: string | null
  noIndex?: boolean | null
} | null

type BuildMetadataArgs = {
  /** Path of the page, e.g. "/blog/my-post". Used for canonical + og:url. */
  path: string
  settings: SiteSetting
  meta?: MetaFields
  /** Used when meta.title is empty. */
  title?: string
  description?: string | null
  image?: unknown
  type?: 'website' | 'article'
  publishedTime?: string | null
  modifiedTime?: string | null
}

/**
 * Builds Next.js metadata from the CMS SEO fields with sensible fallbacks:
 * canonical URL, Open Graph, Twitter card and robots directives.
 */
export const buildMetadata = ({
  path,
  settings,
  meta,
  title,
  description,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
}: BuildMetadataArgs): Metadata => {
  const siteName = settings.siteName || 'FinOracles'
  const resolvedTitle = meta?.title || (title ? `${title} | ${siteName}` : settings.legalName || siteName)
  const resolvedDescription = meta?.description || description || settings.defaultDescription || undefined
  const ogImage =
    getImage(meta?.image, 'og') || getImage(image, 'og') || getImage(settings.defaultOgImage, 'og')
  const canonical = meta?.canonicalURL || absoluteURL(path)
  const images = ogImage
    ? [{ url: absoluteURL(ogImage.src), width: ogImage.width, height: ogImage.height, alt: ogImage.alt }]
    : undefined

  return {
    title: { absolute: resolvedTitle },
    description: resolvedDescription,
    alternates: { canonical },
    robots: meta?.noIndex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type,
      url: canonical,
      siteName,
      title: resolvedTitle,
      description: resolvedDescription,
      locale: 'en_IN',
      images,
      ...(type === 'article'
        ? { publishedTime: publishedTime || undefined, modifiedTime: modifiedTime || undefined }
        : {}),
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title: resolvedTitle,
      description: resolvedDescription,
      images: images?.map((i) => i.url),
      site: settings.twitterHandle || undefined,
    },
  }
}
