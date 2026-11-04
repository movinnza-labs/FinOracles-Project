import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostCard, PostGrid } from '@/components/blog/PostCard'
import { PageHero } from '@/components/sections/PageHero'
import { getCategories, getPostsPage, getSiteSettings } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import styles from './blog.module.css'

type Props = { searchParams: Promise<{ page?: string; category?: string }> }

const PER_PAGE = 9
const TITLE = 'Financial Blogs'
const LEAD = 'Expert insights on market trends, investment strategies, and financial planning tips.'

const buildQuery = (page: number, category?: string) => {
  const q = new URLSearchParams()
  if (category) q.set('category', category)
  if (page > 1) q.set('page', String(page))
  const s = q.toString()
  return s ? `/blog?${s}` : '/blog'
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page, category } = await searchParams
  const settings = await getSiteSettings()
  const meta = buildMetadata({ path: buildQuery(Number(page) || 1, category), settings, title: TITLE, description: LEAD })
  // Filtered listings are useful to visitors but shouldn't compete with /blog in search.
  return category ? { ...meta, robots: { index: false, follow: true } } : meta
}

export default async function BlogIndex({ searchParams }: Props) {
  const { page: pageParam, category } = await searchParams
  const page = Math.max(1, Math.floor(Number(pageParam)) || 1)
  const [posts, categories] = await Promise.all([getPostsPage(page, PER_PAGE, category), getCategories()])
  // Unknown categories and pages past the end are not real listings.
  if (category && categories.length && !categories.some((c) => c.slug === category)) notFound()
  if (page > 1 && page > posts.totalPages) notFound()

  return (
    <>
      <PageHero eyebrow="Resources" title={TITLE} lead={LEAD} breadcrumbs={[{ name: 'Blog', path: '/blog' }]} />
      <section className="section">
        <div className="container">
          {categories.length > 0 && (
            <nav aria-label="Blog categories" className={styles.filters}>
              <Link href="/blog" aria-current={!category ? 'page' : undefined}>
                All
              </Link>
              {categories.map((c) => (
                <Link key={c.id} href={buildQuery(1, c.slug ?? undefined)} aria-current={category === c.slug ? 'page' : undefined}>
                  {c.title}
                </Link>
              ))}
            </nav>
          )}

          {posts.docs.length ? (
            <PostGrid>
              {posts.docs.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </PostGrid>
          ) : (
            <p className="lead">No articles published yet. Please check back soon.</p>
          )}

          {posts.totalPages > 1 && (
            <nav aria-label="Pagination" className={styles.pagination}>
              {posts.hasPrevPage && (
                <Link href={buildQuery(page - 1, category)} rel="prev" className="btn btn--outline">
                  Newer articles
                </Link>
              )}
              <span>
                Page {page} of {posts.totalPages}
              </span>
              {posts.hasNextPage && (
                <Link href={buildQuery(page + 1, category)} rel="next" className="btn btn--outline">
                  Older articles
                </Link>
              )}
            </nav>
          )}
        </div>
      </section>
    </>
  )
}
