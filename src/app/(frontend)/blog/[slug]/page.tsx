import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { Category } from '@/types/content'
import { PostCard, PostGrid } from '@/components/blog/PostCard'
import { PageHero } from '@/components/sections/PageHero'
import { JsonLd } from '@/components/ui/JsonLd'
import { RichText } from '@/components/ui/RichText'
import { getImage } from '@/lib/media'
import { getLatestPosts, getPostBySlug, getPosts, getSiteSettings } from '@/lib/queries'
import { articleSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { formatDate } from '@/lib/text'
import styles from './post.module.css'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export async function generateStaticParams() {
  return (await getPosts()).filter((p) => p.slug).map((p) => ({ slug: p.slug as string }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [post, settings] = await Promise.all([getPostBySlug(slug), getSiteSettings()])
  if (!post) return { title: 'Article not found', robots: { index: false } }
  return buildMetadata({
    path: `/blog/${post.slug}`,
    settings,
    meta: post.meta,
    title: post.title,
    description: post.excerpt,
    image: post.coverImage,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  })
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const [post, recent] = await Promise.all([getPostBySlug(slug), getLatestPosts(4)])
  if (!post) notFound()

  const cover = getImage(post.coverImage)
  const categories = (post.categories ?? []).filter((c): c is Category => typeof c === 'object')
  const related = recent.filter((p) => p.slug !== post.slug).slice(0, 3)

  return (
    <>
      <JsonLd data={articleSchema(post)} />
      <PageHero
        eyebrow={categories[0]?.title ?? 'Blog'}
        title={post.title}
        lead={post.excerpt}
        breadcrumbs={[
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      >
        <p className={styles.byline}>
          {post.author && <span>By {post.author}</span>}
          {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
        </p>
      </PageHero>

      <article className="section">
        <div className="container container--narrow">
          {cover && (
            <figure className={styles.cover}>
              <Image src={cover.src} alt={cover.alt} width={cover.width} height={cover.height} sizes="(max-width: 820px) 92vw, 760px" priority />
            </figure>
          )}
          <RichText data={post.content} />
          <p className={styles.back}>
            <Link href="/blog" className="text-button">
              <ArrowLeft aria-hidden /> BACK TO ALL ARTICLES
            </Link>
          </p>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section section--tinted" aria-labelledby="related">
          <div className="container">
            <h2 id="related" className="h2">
              More articles
            </h2>
            <PostGrid>
              {related.map((p) => (
                <PostCard key={p.id} post={p} headingLevel="h3" />
              ))}
            </PostGrid>
          </div>
        </section>
      )}
    </>
  )
}
