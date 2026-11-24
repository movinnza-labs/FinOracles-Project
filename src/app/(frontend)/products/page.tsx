import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard, ProductGrid } from '@/components/products/ProductCard'
import { PageHero } from '@/components/sections/PageHero'
import { productCategories } from '@/lib/compliance'
import { getHomePage, getProducts, getSiteSettings } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import styles from './products.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata({
    path: '/products',
    settings,
    title: 'Mutual Funds, NPS, PMS & Insurance in Satara | FinOracles',
    description:
      'Compare mutual funds, NPS, equity and ETFs, PMS, loans against mutual funds and insurance. FinOracles helps you pick the right product for every goal.',
  })
}

/** A related page offered under each product group. */
const groupLinks: Record<string, { label: string; url: string }> = {
  invest: { label: 'Try the SIP calculator', url: '/tools' },
  protect: { label: 'Read: how health insurance protects your savings', url: '/blog/health-insurance-protect-savings' },
}

export default async function ProductsPage() {
  const [home, products] = await Promise.all([getHomePage(), getProducts()])

  return (
    <>
      <PageHero
        eyebrow="Our Products"
        title="Investment & Insurance Products for Every Goal"
        lead={home.products?.lead}
        breadcrumbs={[{ name: 'Products', path: '/products' }]}
      />
      {productCategories.map((category, i) => {
        const items = products.filter((p) => p.category === category.value)
        if (!items.length) return null
        return (
          <section
            key={category.value}
            className={`section ${i % 2 === 1 ? 'section--tinted' : ''} ${styles.group}`}
            aria-labelledby={`cat-${category.value}`}
          >
            <div className="container">
              <div className="section-head reveal">
                <p className="eyebrow">{category.label}</p>
                <h2 id={`cat-${category.value}`} className="h2">
                  {category.blurb}
                </h2>
              </div>
              <ProductGrid count={items.length}>
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </ProductGrid>
              {groupLinks[category.value] && (
                <p className={styles.groupLink}>
                  <Link href={groupLinks[category.value].url} className="text-button">
                    {groupLinks[category.value].label}
                    <ArrowRight aria-hidden />
                  </Link>
                </p>
              )}
            </div>
          </section>
        )
      })}
    </>
  )
}
