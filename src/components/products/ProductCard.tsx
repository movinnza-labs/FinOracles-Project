import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Product } from '@/payload-types'
import { IconTile } from '@/components/ui/Icon'
import styles from './ProductCard.module.css'

/** Compact product card linking to the product's landing page. */
export function ProductCard({ product, headingLevel = 'h3' }: { product: Product; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel
  return (
    <li className={`${styles.card} card lift lift-rule reveal`}>
      <IconTile name={product.icon} fallback="chart-pie" />
      <Heading className="h4">
        <Link href={`/products/${product.slug}`} className={styles.link}>
          {product.name}
        </Link>
      </Heading>
      {product.tagline && <p className={styles.tagline}>{product.tagline}</p>}
      {product.idealFor && (
        <p className={styles.ideal}>
          <strong>Ideal for:</strong> {product.idealFor}
        </p>
      )}
      <span className={styles.more} aria-hidden>
        View details <ArrowRight />
      </span>
    </li>
  )
}

export function ProductGrid({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <ul role="list" className={styles.grid} data-count={count}>
      {children}
    </ul>
  )
}
