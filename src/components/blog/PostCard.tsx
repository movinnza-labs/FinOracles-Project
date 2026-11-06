import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Category, Post } from '@/payload-types'
import { getImage } from '@/lib/media'
import { formatDate } from '@/lib/text'
import styles from './PostCard.module.css'

type PostSummary = Pick<Post, 'id' | 'title' | 'slug' | 'excerpt' | 'coverImage' | 'publishedAt' | 'categories'>

export function PostCard({ post, headingLevel = 'h2' }: { post: PostSummary; headingLevel?: 'h2' | 'h3' }) {
  const image = getImage(post.coverImage, 'card')
  const category = post.categories?.find((c): c is Category => typeof c === 'object')
  const Heading = headingLevel

  return (
    <article className={`${styles.card} lift lift-rule reveal`}>
      <div className={styles.media}>
        {image && (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(max-width: 767px) 92vw, (max-width: 1023px) 45vw, 380px"
          />
        )}
      </div>
      <div className={styles.body}>
        <p className={styles.meta}>
          {category && <span className="tag">{category.title}</span>}
          {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
        </p>
        <Heading className={styles.title}>
          <Link href={`/blog/${post.slug}`} className={styles.link}>
            {post.title}
          </Link>
        </Heading>
        {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
        <span className={styles.more} aria-hidden>
          Read article <ArrowRight />
        </span>
      </div>
    </article>
  )
}

export function PostGrid({ children }: { children: React.ReactNode }) {
  return <div className={styles.grid}>{children}</div>
}
