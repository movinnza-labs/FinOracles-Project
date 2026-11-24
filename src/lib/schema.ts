import type { Post, Product, Service, SiteSetting, TeamMember } from '@/payload-types'
import { getImage } from './media'
import { absoluteURL } from './url'

/** schema.org JSON-LD builders. */

const orgId = () => absoluteURL('/#organization')
const founderId = () => absoluteURL('/about#founder')

/** The local market FinOracles serves: Satara, Maharashtra (local SEO), not all of India. */
const areaServed = {
  '@type': 'City',
  name: 'Satara',
  containedInPlace: { '@type': 'State', name: 'Maharashtra' },
}

/** Team roles are stored in short form ("MD"); schema.org jobTitle reads better spelled out. */
const jobTitles: Record<string, string> = { MD: 'Managing Director' }

/** The founder / Managing Director as a schema.org Person (the team member marked "Featured leader"). */
export const founderSchema = (leader: TeamMember) => {
  const photo = getImage(leader.photo)
  return {
    '@type': 'Person',
    '@id': founderId(),
    name: leader.name,
    jobTitle: jobTitles[leader.role] ?? leader.role,
    image: photo ? absoluteURL(photo.src) : undefined,
    worksFor: { '@id': orgId() },
    url: absoluteURL('/about'),
  }
}

export const organizationSchema = (s: SiteSetting, founder?: TeamMember | null) => {
  const logo = getImage(s.logo)
  const { latitude, longitude } = s.address ?? {}
  return {
    '@context': 'https://schema.org',
    // FinancialService is already a subtype of LocalBusiness, so listing both is redundant.
    '@type': 'FinancialService',
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
    geo:
      typeof latitude === 'number' && typeof longitude === 'number'
        ? { '@type': 'GeoCoordinates', latitude, longitude }
        : undefined,
    hasMap: s.address?.mapUrl || undefined,
    openingHours: s.openingHours || undefined,
    sameAs: s.socials?.map((x) => x.url).filter(Boolean),
    areaServed,
    founder: founder ? founderSchema(founder) : undefined,
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

/** /about: the page is about the organization (and names its Managing Director). */
export const aboutPageSchema = (founder?: TeamMember | null) => ({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  url: absoluteURL('/about'),
  mainEntity: { '@id': orgId() },
  about: founder ? { '@id': founderId() } : undefined,
})

export const contactPageSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  url: absoluteURL('/contact'),
  mainEntity: { '@id': orgId() },
})

/** /tools: the free calculators as a web app (valid structured data; Google shows no rich result for it). */
export const calculatorsSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'SIP, Lumpsum & Goal Calculators',
  url: absoluteURL('/tools'),
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  provider: { '@id': orgId() },
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

/** Author names that mean "the company", not a person. */
const companyAuthors = new Set(['', 'finoracles', 'finoracles services pvt. ltd.', 'finoracles team'])

export const articleSchema = (post: Post) => {
  const image = getImage(post.coverImage, 'og')
  const author = post.author?.trim() ?? ''
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta?.description || post.excerpt || undefined,
    image: image ? [absoluteURL(image.src)] : undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    // A named author is a Person on the FinOracles team; without one the company is the author.
    author: companyAuthors.has(author.toLowerCase())
      ? { '@id': orgId() }
      : { '@type': 'Person', name: author, url: absoluteURL('/about'), worksFor: { '@id': orgId() } },
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
  areaServed,
  url: absoluteURL(`/services/${service.slug}`),
})

export const productServiceSchema = (product: Product, serviceType?: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: product.name,
  serviceType,
  description: product.description,
  provider: { '@id': orgId() },
  areaServed,
  url: absoluteURL(`/products/${product.slug}`),
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
