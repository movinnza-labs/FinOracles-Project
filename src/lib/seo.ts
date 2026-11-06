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

const MAX_TITLE = 60
const MAX_DESCRIPTION = 160

/**
 * Shortens fallback text (e.g. a long product description) to whole sentences
 * within the length search engines show; cuts at a word if the first sentence is too long.
 */
export const summarize = (text: string, max = MAX_DESCRIPTION): string => {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  // Sentence ends: . ! ? followed by a space and a capital, but not after abbreviations like "Pvt." or "Ltd.".
  const sentences = clean.split(/(?<!\b(?:Pvt|Ltd|Co|Mr|Mrs|Ms|Dr|Sr|Jr|vs|etc|e\.g|i\.e)\.)(?<=[.!?])\s+(?=[A-Z"“])/)
  let out = ''
  for (const sentence of sentences) {
    const next = out ? `${out} ${sentence}` : sentence
    if (next.length > max) break
    out = next
  }
  // Whole sentences are best, unless they leave the description too short to be useful.
  if (out.length >= max * 0.7) return out
  return `${clean
    .slice(0, max - 1)
    .replace(/\s+\S*$/, '')
    .replace(/[\s,;:—-]+$/, '')}…`
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
  // Drop the " | FinOracles" suffix when it would push the title past what search results show.
  const suffixed = title ? `${title} | ${siteName}` : undefined
  const resolvedTitle =
    meta?.title || (suffixed && suffixed.length > MAX_TITLE ? title : suffixed) || settings.legalName || siteName
  // Editor-written SEO descriptions are used as-is; fallbacks are trimmed to fit.
  const fallbackDescription = description || settings.defaultDescription
  const resolvedDescription = meta?.description || (fallbackDescription ? summarize(fallbackDescription) : undefined)
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
