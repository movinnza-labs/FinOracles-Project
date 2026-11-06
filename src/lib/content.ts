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
} from '@/types/content'
import { buildContent } from '@/content/content'
import { publicImagePath, seedImages, type SeedImageKey } from '@/content/images'

/**
 * The site's content, built from src/content/content.ts in the shapes the pages expect.
 * Images point at the static copies in /public/images.
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

const source = buildContent(staticMedia)
const withMeta = <T extends object>(doc: T, id: number) => ({ id, updatedAt: stamp, createdAt: stamp, ...doc })

export const content = {
  siteSettings: withMeta(source.siteSettings, 0) as unknown as SiteSetting,
  header: withMeta(source.header, 0) as unknown as Header,
  footer: withMeta(source.footer, 0) as unknown as Footer,
  homePage: withMeta(source.homePage, 0) as unknown as HomePage,
  products: source.products.map((p, i) => withMeta(p, i + 1)) as unknown as Product[],
  team: source.team.map((m, i) => withMeta(m, i + 1)) as unknown as TeamMember[],
  services: source.services.map((s, i) => withMeta(s, i + 1)) as unknown as Service[],
  posts: source.posts.map((p, i) =>
    withMeta({ ...p, categories: [], _status: 'published', publishedAt: stamp }, i + 1),
  ) as unknown as Post[],
  pages: source.pages.map((p, i) => withMeta({ ...p, _status: 'published' }, i + 1)) as unknown as Page[],
}
