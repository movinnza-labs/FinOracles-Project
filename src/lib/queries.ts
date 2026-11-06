import { content } from './content'

/**
 * Data layer for the public site. All content is bundled with the code
 * (src/content/content.ts) and read at build time, so the site exports to plain
 * static files with no database or CMS. To change text, edit src/content/content.ts
 * and rebuild.
 *
 * The functions stay async so pages keep the same shape if a data source is added later.
 */

export const getSiteSettings = async () => content.siteSettings
export const getHeader = async () => content.header
export const getFooter = async () => content.footer
export const getHomePage = async () => content.homePage

export const getProducts = async () => content.products
export const getTeam = async () => content.team
export const getServices = async () => content.services
export const getHomeServices = async () => content.services.filter((s) => s.showOnHome !== false)

export const getServiceBySlug = async (slug: string) => content.services.find((s) => s.slug === slug) ?? null
export const getProductBySlug = async (slug: string) => content.products.find((p) => p.slug === slug) ?? null

/** Newest first. */
const sortedPosts = () =>
  [...content.posts].sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))

export const getPosts = async () => sortedPosts()
export const getLatestPosts = async (limit: number) => sortedPosts().slice(0, limit)
export const getPostBySlug = async (slug: string) => content.posts.find((p) => p.slug === slug) ?? null

export const getPages = async () => content.pages
export const getPageBySlug = async (slug: string) => content.pages.find((p) => p.slug === slug) ?? null

/** Every public URL with its last-modified date, for sitemap.xml. */
export const getSitemapEntries = async () => {
  const keep = (d: { meta?: { noIndex?: boolean | null } | null }) => !d.meta?.noIndex
  const entry = (d: { slug?: string | null; updatedAt: string }) => ({ slug: d.slug, updatedAt: d.updatedAt })
  return {
    pages: content.pages.filter(keep).map(entry),
    posts: content.posts.filter(keep).map(entry),
    services: content.services.filter(keep).map(entry),
    products: content.products.filter(keep).map(entry),
  }
}
