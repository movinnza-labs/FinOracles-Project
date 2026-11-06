import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { PageHero } from '@/components/sections/PageHero'
import { getPageBySlug, getSiteSettings } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [page, settings] = await Promise.all([getPageBySlug(slug), getSiteSettings()])
  if (!page) return { title: 'Page not found', robots: { index: false } }
  return buildMetadata({
    path: `/${page.slug}`,
    settings,
    meta: page.meta,
    title: page.title,
    description: page.hero?.lead,
  })
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params
  const [page, settings] = await Promise.all([getPageBySlug(slug), getSiteSettings()])
  if (!page) notFound()

  return (
    <>
      <PageHero
        eyebrow={page.hero?.eyebrow}
        title={page.hero?.heading || page.title}
        lead={page.hero?.lead}
        breadcrumbs={[{ name: page.title, path: `/${page.slug}` }]}
      />
      <RenderBlocks blocks={page.layout} settings={settings} />
    </>
  )
}
