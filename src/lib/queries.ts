import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import { getPayload, type Where } from 'payload'
import { Client } from 'pg'
import config from '@payload-config'
import { tags } from './cacheTags'
import { fallback } from './fallback'

/**
 * Data layer for the public site. Reads go through Payload's Local API (no HTTP
 * hop), are cached with Next.js tags, and are expired by the CMS afterChange
 * hooks (hooks/revalidate.ts). Draft mode bypasses the cache to show drafts.
 */

const PLACEHOLDER_PASSWORD = 'YOUR_POSTGRES_PASSWORD'
const RETRY_AFTER_MS = 30_000
let lastConnectFailure = 0
let databaseVerified = false

/**
 * Opens and closes a plain connection to check the database is reachable and the
 * credentials work. Payload's Postgres adapter turns a failed connection into an
 * unhandled rejection with no error attached, so it must only start once this passes.
 */
const probeDatabase = async (connectionString: string) => {
  const client = new Client({ connectionString, connectionTimeoutMillis: 5_000 })
  try {
    await client.connect()
  } finally {
    await client.end().catch(() => {})
  }
}

/**
 * Payload Local API client. Refuses to connect when DATABASE_URL is missing or still
 * the .env.example placeholder, probes the database before Payload's first connection,
 * and backs off after a failure so retrying on every request doesn't flood the logs.
 */
export const getPayloadClient = async () => {
  const url = process.env.DATABASE_URL
  if (!url || url.includes(PLACEHOLDER_PASSWORD)) {
    throw new Error('DATABASE_URL is not configured (set your PostgreSQL password in .env)')
  }
  if (Date.now() - lastConnectFailure < RETRY_AFTER_MS) {
    throw new Error('Database unavailable, retrying shortly')
  }
  try {
    if (!databaseVerified) {
      await probeDatabase(url)
      databaseVerified = true
    }
    return await getPayload({ config })
  } catch (err) {
    lastConnectFailure = Date.now()
    throw err
  }
}

const ONE_HOUR = 60 * 60

const isDraft = async () => {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false
  }
}

/** True until the homepage has been saved in the CMS (fresh, unseeded database). */
const isUnseeded = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    const home = await payload.findGlobal({ slug: 'home-page', depth: 0 })
    return !home?.hero?.title
  },
  ['cms-unseeded'],
  { tags: [tags.global('home-page')], revalidate: ONE_HOUR },
)

// Warn once per server process rather than on every read (each page makes several).
let warnedUnreachable = false

/** Runs a cached CMS read, falling back to bundled defaults if the CMS is empty or unreachable. */
async function withFallback<T>(read: () => Promise<T>, fallbackValue: T): Promise<T> {
  try {
    if (await isUnseeded()) return fallbackValue
    return await read()
  } catch (err) {
    if (!warnedUnreachable) {
      warnedUnreachable = true
      console.warn(
        '[cms] Database unavailable, showing built-in default content. Check DATABASE_URL in .env.',
        err instanceof Error ? `(${err.message})` : '',
      )
    }
    return fallbackValue
  }
}

const readGlobal = <S extends 'site-settings' | 'header' | 'footer' | 'home-page'>(slug: S) =>
  unstable_cache(
    async () => (await getPayloadClient()).findGlobal({ slug, depth: 1 }),
    [`global-${slug}`],
    { tags: [tags.global(slug)], revalidate: ONE_HOUR },
  )

export const getSiteSettings = cache(() => withFallback(readGlobal('site-settings'), fallback.siteSettings))
export const getHeader = cache(() => withFallback(readGlobal('header'), fallback.header))
export const getFooter = cache(() => withFallback(readGlobal('footer'), fallback.footer))
export const getHomePage = cache(() => withFallback(readGlobal('home-page'), fallback.homePage))

const listCollection = <S extends 'products' | 'team-members' | 'services'>(slug: S, where?: Where) =>
  unstable_cache(
    async () => {
      const { docs } = await (await getPayloadClient()).find({
        collection: slug,
        depth: 1,
        limit: 100,
        sort: 'order',
        where,
        pagination: false,
      })
      return docs
    },
    [`list-${slug}-${JSON.stringify(where ?? {})}`],
    { tags: [tags.collection(slug)], revalidate: ONE_HOUR },
  )

export const getProducts = cache(() => withFallback(listCollection('products'), fallback.products))
export const getTeam = cache(() => withFallback(listCollection('team-members'), fallback.team))
export const getServices = cache(() => withFallback(listCollection('services'), fallback.services))
export const getHomeServices = cache(() =>
  withFallback(listCollection('services', { showOnHome: { equals: true } }), fallback.services),
)

export const getServiceBySlug = cache((slug: string) =>
  withFallback(
    unstable_cache(
      async () => {
        const { docs } = await (await getPayloadClient()).find({
          collection: 'services',
          where: { slug: { equals: slug } },
          limit: 1,
          depth: 1,
        })
        return docs[0] ?? null
      },
      [`service-${slug}`],
      { tags: [tags.doc('services', slug), tags.collection('services')], revalidate: ONE_HOUR },
    ),
    fallback.services.find((s) => s.slug === slug) ?? null,
  ),
)

export const getProductBySlug = cache((slug: string) =>
  withFallback(
    unstable_cache(
      async () => {
        const { docs } = await (await getPayloadClient()).find({
          collection: 'products',
          where: { slug: { equals: slug } },
          limit: 1,
          depth: 1,
        })
        return docs[0] ?? null
      },
      [`product-${slug}`],
      { tags: [tags.doc('products', slug), tags.collection('products')], revalidate: ONE_HOUR },
    ),
    fallback.products.find((p) => p.slug === slug) ?? null,
  ),
)

/* ---- Draft-aware collections (pages, posts) --------------------------- */

const published: Where = { _status: { equals: 'published' } }

export const getPostsPage = cache(async (page = 1, limit = 9, category?: string) => {
  const where: Where = { and: [published, ...(category ? [{ 'categories.slug': { equals: category } }] : [])] }
  const read = unstable_cache(
    async () =>
      (await getPayloadClient()).find({
        collection: 'posts',
        where,
        sort: '-publishedAt',
        depth: 1,
        limit,
        page,
        select: { title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true, categories: true, author: true },
      }),
    [`posts-${page}-${limit}-${category ?? 'all'}`],
    { tags: [tags.collection('posts')], revalidate: ONE_HOUR },
  )
  const empty = {
    docs: fallback.posts.slice(0, limit),
    totalDocs: fallback.posts.length,
    totalPages: 1,
    page: 1,
    hasNextPage: false,
    hasPrevPage: false,
  }
  return withFallback(read, empty as unknown as Awaited<ReturnType<typeof read>>)
})

export const getPostBySlug = cache(async (slug: string) => {
  const draft = await isDraft()
  const read = async () => {
    const { docs } = await (await getPayloadClient()).find({
      collection: 'posts',
      where: draft ? { slug: { equals: slug } } : { and: [{ slug: { equals: slug } }, published] },
      draft,
      limit: 1,
      depth: 2,
    })
    return docs[0] ?? null
  }
  return withFallback(
    draft
      ? read
      : unstable_cache(read, [`post-${slug}`], {
          tags: [tags.doc('posts', slug)],
          revalidate: ONE_HOUR,
        }),
    fallback.posts.find((p) => p.slug === slug) ?? null,
  )
})

export const getPageBySlug = cache(async (slug: string) => {
  const draft = await isDraft()
  const read = async () => {
    const { docs } = await (await getPayloadClient()).find({
      collection: 'pages',
      where: draft ? { slug: { equals: slug } } : { and: [{ slug: { equals: slug } }, published] },
      draft,
      limit: 1,
      depth: 2,
    })
    return docs[0] ?? null
  }
  return withFallback(
    draft
      ? read
      : unstable_cache(read, [`page-${slug}`], {
          tags: [tags.doc('pages', slug)],
          revalidate: ONE_HOUR,
        }),
    fallback.pages.find((p) => p.slug === slug) ?? null,
  )
})

export const getCategories = cache(() =>
  withFallback(
    unstable_cache(
      async () =>
        (await (await getPayloadClient()).find({ collection: 'categories', limit: 50, sort: 'title', pagination: false }))
          .docs,
      ['categories'],
      { tags: [tags.collection('categories')], revalidate: ONE_HOUR },
    ),
    [],
  ),
)

/** Every public URL with its last-modified date, for sitemap.xml. */
export const getSitemapEntries = () =>
  withFallback(
    unstable_cache(
      async () => {
        const payload = await getPayloadClient()
        const opts = { where: published, limit: 1000, pagination: false, depth: 0 } as const
        const [pages, posts, services, products] = await Promise.all([
          payload.find({ collection: 'pages', ...opts, select: { slug: true, updatedAt: true, meta: { noIndex: true } } }),
          payload.find({ collection: 'posts', ...opts, select: { slug: true, updatedAt: true, meta: { noIndex: true } } }),
          payload.find({
            collection: 'services',
            limit: 1000,
            pagination: false,
            depth: 0,
            select: { slug: true, updatedAt: true, meta: { noIndex: true } },
          }),
          payload.find({
            collection: 'products',
            limit: 1000,
            pagination: false,
            depth: 0,
            select: { slug: true, updatedAt: true, meta: { noIndex: true } },
          }),
        ])
        const keep = (d: { meta?: { noIndex?: boolean | null } | null }) => !d.meta?.noIndex
        return {
          pages: pages.docs.filter(keep).map((d) => ({ slug: d.slug, updatedAt: d.updatedAt })),
          posts: posts.docs.filter(keep).map((d) => ({ slug: d.slug, updatedAt: d.updatedAt })),
          services: services.docs.filter(keep).map((d) => ({ slug: d.slug, updatedAt: d.updatedAt })),
          products: products.docs.filter(keep).map((d) => ({ slug: d.slug, updatedAt: d.updatedAt })),
        }
      },
      ['sitemap'],
      { tags: [tags.sitemap], revalidate: ONE_HOUR },
    ),
    {
      pages: fallback.pages.map((d) => ({ slug: d.slug, updatedAt: d.updatedAt })),
      posts: fallback.posts.map((d) => ({ slug: d.slug, updatedAt: d.updatedAt })),
      services: fallback.services.map((d) => ({ slug: d.slug, updatedAt: d.updatedAt })),
      products: fallback.products.map((d) => ({ slug: d.slug, updatedAt: d.updatedAt })),
    },
  )
