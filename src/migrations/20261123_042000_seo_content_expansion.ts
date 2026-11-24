import { existsSync } from 'node:fs'
import path from 'node:path'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Payload, PayloadRequest } from 'payload'
import { draftPosts, productSections, serviceSections } from '../seed/expansion'
import { richText } from '../seed/lexical'

/**
 * Remaining items from the on-page SEO recommendations, for a database seeded before them:
 *  - "Who should consider it" / "How it works with FinOracles" on the 10 product pages
 *  - longer content on the 3 service pages
 *  - Client Desk: a market-chart image instead of the new-home photo
 *  - a branded 1200 x 630 default share image (site default and homepage)
 *  - the four suggested blog posts, created as DRAFTS for review
 * Every change is guarded so editor changes are never overwritten. On a fresh database nothing
 * matches and the seed writes the same content itself.
 */

type Doc = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
const context = { disableRevalidate: true }

/** A seeded image, also when Payload saved a duplicate upload as "about-1.webp". */
const findMedia = async (payload: Payload, req: PayloadRequest, file: string): Promise<Doc | undefined> => {
  const base = file.replace(/\.(webp|png)$/, '')
  const sameFile = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(-\\d+)?\\.(webp|png)$`)
  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { like: base } },
    limit: 50,
    depth: 0,
    req,
    overrideAccess: true,
  })
  return (docs as Doc[]).find((d) => sameFile.test(d.filename ?? ''))
}

const idOf = (value: unknown) => (value && typeof value === 'object' ? (value as Doc).id : value)

const plain = (node: Doc): string =>
  node.type === 'text' ? String(node.text ?? '') : ((node.children ?? []) as Doc[]).map(plain).join('')

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const log = (msg: string) => payload.logger.info(`[seo-expansion] ${msg}`)
  const common = { req, context, overrideAccess: true, depth: 0 } as const

  // Product pages: two new sections (only while empty)
  for (const [slug, sections] of Object.entries(productSections)) {
    const { docs } = await payload.find({ collection: 'products', where: { slug: { equals: slug } }, limit: 1, ...common })
    const doc = docs[0] as Doc | undefined
    if (!doc) continue
    const data: Doc = {}
    if (!doc.whoShouldConsider) data.whoShouldConsider = sections.whoShouldConsider
    if (!doc.howItWorks) data.howItWorks = sections.howItWorks
    if (Object.keys(data).length) {
      await payload.update({ collection: 'products', id: doc.id, data: data as never, ...common })
      log(`product ${slug}: ${Object.keys(data).join(', ')}`)
    }
  }

  // Service pages: append the new sections (only if their first heading is not there yet)
  for (const [slug, blocks] of Object.entries(serviceSections)) {
    const { docs } = await payload.find({ collection: 'services', where: { slug: { equals: slug } }, limit: 1, ...common })
    const doc = docs[0] as Doc | undefined
    const root = doc?.content?.root as Doc | undefined
    if (!doc || !root) continue
    const marker = (blocks[0] as { h2: string }).h2
    const children = (root.children ?? []) as Doc[]
    if (children.some((n) => n.type === 'heading' && plain(n) === marker)) continue
    const added = (richText(blocks).root as Doc).children as Doc[]
    // Client Desk ends with its "Talk to our team…" line; keep that last.
    const last = children[children.length - 1]
    const keepLast = last && plain(last) === 'Talk to our team to get your Client Desk set up.'
    const next = keepLast ? [...children.slice(0, -1), ...added, last] : [...children, ...added]
    await payload.update({
      collection: 'services',
      id: doc.id,
      data: { content: { ...doc.content, root: { ...root, children: next } } } as never,
      ...common,
    })
    log(`service ${slug}: content sections`)
  }

  // Client Desk: the new-home photo did not match the service; use the market-chart image.
  const { docs: desks } = await payload.find({ collection: 'services', where: { slug: { equals: 'client-desk' } }, limit: 1, ...common })
  const desk = desks[0] as Doc | undefined
  if (desk) {
    const homePhoto = await findMedia(payload, req, 'family-home.webp')
    const chart = await findMedia(payload, req, 'early-investor.webp')
    if (homePhoto && chart && idOf(desk.image) === homePhoto.id) {
      await payload.update({ collection: 'services', id: desk.id, data: { image: chart.id } as never, ...common })
      log('service client-desk: image')
    }
  }

  // Default share image (1200 x 630), replacing the seeded 501 x 489 photo
  const settings = (await payload.findGlobal({ slug: 'site-settings', ...common })) as Doc
  const home = (await payload.findGlobal({ slug: 'home-page', ...common })) as Doc
  const seededPhoto = await findMedia(payload, req, 'family-retirement.webp')
  const usesSeededPhoto = (value: unknown) => !!seededPhoto && idOf(value) === seededPhoto.id
  if (usesSeededPhoto(settings?.defaultOgImage) || usesSeededPhoto(home?.meta?.image)) {
    const file = path.resolve(process.cwd(), 'public/images/finoracles/og-default.png')
    let og = await findMedia(payload, req, 'og-default.png')
    if (!og && existsSync(file)) {
      og = (await payload.create({
        collection: 'media',
        data: {
          alt: 'FinOracles Services Pvt. Ltd., Wings for a Wealthy Future. AMFI-registered mutual fund distributor, ARN 300933, Satara',
        },
        filePath: file,
        ...common,
      })) as Doc
      log('media: uploaded og-default.png')
    }
    if (og) {
      if (usesSeededPhoto(settings?.defaultOgImage)) {
        await payload.updateGlobal({ slug: 'site-settings', data: { defaultOgImage: og.id } as never, ...common })
        log('site settings: default share image')
      }
      if (usesSeededPhoto(home?.meta?.image)) {
        await payload.updateGlobal({ slug: 'home-page', data: { meta: { ...home.meta, image: og.id } } as never, ...common })
        log('homepage: share image')
      }
    } else {
      payload.logger.warn('[seo-expansion] og-default.png not found; set the default share image in Site Settings.')
    }
  }

  // Suggested blog posts, as drafts (never published by this migration). On an empty database
  // the first-boot seed runs after migrations and creates them itself, so skip them here.
  const { totalDocs: seededProducts } = await payload.count({ collection: 'products', req, overrideAccess: true })
  if (seededProducts === 0) return
  const covers: Record<string, string> = {
    retirement: 'family-retirement.webp',
    home: 'family-home.webp',
    savings: 'family-savings.webp',
    child: 'family-child.webp',
  }
  for (const post of draftPosts) {
    const { totalDocs } = await payload.count({ collection: 'posts', where: { slug: { equals: post.slug } }, req, overrideAccess: true })
    if (totalDocs > 0) continue
    const { docs: cats } = await payload.find({ collection: 'categories', where: { slug: { equals: post.category } }, limit: 1, ...common })
    const cover = await findMedia(payload, req, covers[post.cover])
    await payload.create({
      collection: 'posts',
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: cover?.id,
        categories: cats[0] ? [cats[0].id] : [],
        content: richText(post.content),
        meta: post.meta,
        _status: 'draft',
      } as never,
      draft: true,
      ...common,
    })
    log(`post ${post.slug}: created as draft`)
  }
}

/** Content-only migration: rolling back the code leaves the content in place. */
export async function down(_args: MigrateDownArgs): Promise<void> {}
