import type {
  Footer,
  Header,
  HomePage,
  Media,
  Page,
  Post,
  Product,
  Service,
  SiteSetting,
  TeamMember,
} from '@/payload-types'
import { buildContent } from '@/seed/content'
import { publicImagePath, seedImages, type SeedImageKey } from '@/seed/images'

/**
 * Default content rendered before the database has been seeded (or if it is
 * unreachable), so a fresh deploy never shows an empty site. Images point at
 * the static copies in /public.
 */
const stamp = '2026-01-01T00:00:00.000Z'

const staticMedia = (key: SeedImageKey): Media => ({
  id: 0,
  alt: seedImages[key].alt,
  url: publicImagePath(key),
  width: seedImages[key].width,
  height: seedImages[key].height,
  filename: seedImages[key].file,
  mimeType: 'image/webp',
  updatedAt: stamp,
  createdAt: stamp,
})

const content = buildContent(staticMedia)
const withMeta = <T extends object>(doc: T, id: number) => ({ id, updatedAt: stamp, createdAt: stamp, ...doc })

export const fallback = {
  siteSettings: withMeta(content.siteSettings, 0) as unknown as SiteSetting,
  header: withMeta(content.header, 0) as unknown as Header,
  footer: withMeta(content.footer, 0) as unknown as Footer,
  homePage: withMeta(content.homePage, 0) as unknown as HomePage,
  products: content.products.map((p, i) => withMeta({ ...p, slug: String(i) }, i + 1)) as unknown as Product[],
  team: content.team.map((m, i) => withMeta(m, i + 1)) as unknown as TeamMember[],
  services: content.services.map((s, i) => withMeta(s, i + 1)) as unknown as Service[],
  posts: content.posts.map((p, i) =>
    withMeta({ ...p, categories: [], _status: 'published', publishedAt: stamp }, i + 1),
  ) as unknown as Post[],
  pages: content.pages.map((p, i) => withMeta({ ...p, _status: 'published' }, i + 1)) as unknown as Page[],
}
