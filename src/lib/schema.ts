import type { Post, Service, SiteSetting } from '@/types/content'
import { getImage } from './media'
import { absoluteURL } from './url'

/** schema.org JSON-LD builders. */

const orgId = () => absoluteURL('/#organization')

export const organizationSchema = (s: SiteSetting) => {
  const logo = getImage(s.logo)
  return {
    '@context': 'https://schema.org',
    '@type': ['FinancialService', 'LocalBusiness'],
    '@id': orgId(),
    name: s.legalName,
    alternateName: s.siteName,
    slogan: s.tagline || undefined,
    url: absoluteURL('/'),
    logo: logo ? absoluteURL(logo.src) : undefined,
    image: logo ? absoluteURL(logo.src) : undefined,
    description: s.defaultDescription || undefined,
    telephone: s.phones?.[0]?.number,
    email: s.emails?.[0]?.email,
    address: s.address?.locality
      ? {
          '@type': 'PostalAddress',
          streetAddress: s.address.street || undefined,
          addressLocality: s.address.locality,
          addressRegion: s.address.region || undefined,
          postalCode: s.address.postalCode || undefined,
          addressCountry: s.address.country || 'IN',
        }
      : undefined,
    hasMap: s.address?.mapUrl || undefined,
    openingHours: s.openingHours || undefined,
    sameAs: s.socials?.map((x) => x.url).filter(Boolean),
    areaServed: 'IN',
  }
}

export const websiteSchema = (s: SiteSetting) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': absoluteURL('/#website'),
  url: absoluteURL('/'),
  name: s.legalName,
  publisher: { '@id': orgId() },
  inLanguage: 'en-IN',
})

export const breadcrumbSchema = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: absoluteURL(item.path),
  })),
})

export const articleSchema = (post: Post) => {
  const image = getImage(post.coverImage, 'og')
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta?.description || post.excerpt || undefined,
    image: image ? [absoluteURL(image.src)] : undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Organization', name: post.author || 'FinOracles' },
    publisher: { '@id': orgId() },
    mainEntityOfPage: absoluteURL(`/blog/${post.slug}`),
  }
}

export const serviceSchema = (service: Service) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.title,
  description: service.summary,
  provider: { '@id': orgId() },
  areaServed: 'IN',
  url: absoluteURL(`/services/${service.slug}`),
})

export const faqSchema = (items: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
})
