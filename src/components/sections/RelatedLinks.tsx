import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import styles from './RelatedLinks.module.css'

type RelatedLink = { id?: string | null; label: string; url: string }

/** "Learn more" internal links on product and service pages (CMS field: relatedLinks). */
export function RelatedLinks({ links, heading = 'Learn more' }: { links?: RelatedLink[] | null; heading?: string }) {
  // Site paths only: these are internal links, and it keeps a pasted javascript: URL from rendering.
  const items = (links ?? []).filter((l) => l.label && /^\/(?!\/)/.test(l.url))
  if (!items.length) return null
  return (
    <nav className={`${styles.links} reveal`} aria-label={heading}>
      <h2 className="h4">{heading}</h2>
      <ul role="list">
        {items.map((l) => (
          <li key={l.id ?? l.url}>
            <Link href={l.url}>
              {l.label}
              <ArrowRight aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
