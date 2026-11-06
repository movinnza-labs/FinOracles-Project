import type { Metadata } from 'next'
import { PostCard, PostGrid } from '@/components/blog/PostCard'
import { PageHero } from '@/components/sections/PageHero'
import { getPosts, getSiteSettings } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'

const TITLE = 'Financial Blogs'
const LEAD = 'Expert insights on market trends, investment strategies, and financial planning tips.'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata({ path: '/blog', settings, title: TITLE, description: LEAD })
}

export default async function BlogIndex() {
  const posts = await getPosts()

  return (
    <>
      <PageHero eyebrow="Resources" title={TITLE} lead={LEAD} breadcrumbs={[{ name: 'Blog', path: '/blog' }]} />
      <section className="section">
        <div className="container">
          {posts.length ? (
            <PostGrid>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </PostGrid>
          ) : (
            <p className="lead">No articles published yet. Please check back soon.</p>
          )}
        </div>
      </section>
    </>
  )
}
