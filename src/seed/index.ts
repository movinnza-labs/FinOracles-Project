import path from 'node:path'
import type { CollectionSlug, Payload } from 'payload'
import { buildContent } from './content'
import { seedImages, type SeedImageKey } from './images'

const contentCollections: CollectionSlug[] = [
  'posts',
  'categories',
  'pages',
  'services',
  'products',
  'team-members',
  'media',
]

type SeedOptions = {
  /** Skip when the database already has content (safe for automatic runs). */
  onlyIfEmpty?: boolean
}

/**
 * Populates the CMS with the approved FinOracles content and images.
 * Re-running with `onlyIfEmpty: false` wipes the content collections first.
 */
export const seed = async (payload: Payload, { onlyIfEmpty = true }: SeedOptions = {}) => {
  const context = { disableRevalidate: true }
  const { totalDocs: existing } = await payload.count({ collection: 'products' })

  if (existing > 0 && onlyIfEmpty) {
    payload.logger.info('Seed skipped: content already exists. Run with SEED_FORCE=true to replace it.')
    return
  }

  payload.logger.info('Seeding FinOracles content…')

  if (existing > 0) {
    for (const collection of contentCollections) {
      await payload.delete({ collection, where: { id: { exists: true } }, context, depth: 0 })
    }
  }

  // Media
  const mediaIds = {} as Record<SeedImageKey, number>
  const imageDir = path.resolve(process.cwd(), 'public/images/finoracles')
  for (const [key, image] of Object.entries(seedImages) as [SeedImageKey, (typeof seedImages)[SeedImageKey]][]) {
    const doc = await payload.create({
      collection: 'media',
      data: { alt: image.alt },
      filePath: path.join(imageDir, image.file),
      context,
    })
    mediaIds[key] = doc.id
  }

  const content = buildContent((key) => mediaIds[key])

  // Globals
  await payload.updateGlobal({ slug: 'site-settings', data: content.siteSettings, context })
  await payload.updateGlobal({ slug: 'header', data: content.header, context })
  await payload.updateGlobal({ slug: 'footer', data: content.footer, context })
  await payload.updateGlobal({ slug: 'home-page', data: content.homePage as never, context })

  // Collections
  for (const product of content.products) {
    await payload.create({ collection: 'products', data: product as never, context })
  }
  for (const member of content.team) {
    await payload.create({ collection: 'team-members', data: member, context })
  }
  for (const service of content.services) {
    await payload.create({ collection: 'services', data: service as never, context })
  }

  const categoryIds: Record<string, number> = {}
  for (const category of content.categories) {
    const doc = await payload.create({ collection: 'categories', data: category, context })
    categoryIds[category.slug] = doc.id
  }

  const now = Date.now()
  for (const [i, { category, ...post }] of content.posts.entries()) {
    await payload.create({
      collection: 'posts',
      data: {
        ...post,
        categories: [categoryIds[category]],
        publishedAt: new Date(now - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
        _status: 'published',
      } as never,
      context,
    })
  }

  for (const page of content.pages) {
    await payload.create({ collection: 'pages', data: { ...page, _status: 'published' } as never, context })
  }

  // First admin user (optional; otherwise create one at /admin on first visit).
  const { totalDocs: users } = await payload.count({ collection: 'users' })
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (users === 0 && email && password) {
    await payload.create({ collection: 'users', data: { email, password, name: 'Administrator', role: 'admin' } })
    payload.logger.info(`Created admin user ${email}`)
  }

  payload.logger.info('Seed complete.')
}
