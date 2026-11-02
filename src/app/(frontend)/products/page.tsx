import type { Metadata } from 'next'
import { ProductCard, ProductGrid } from '@/components/products/ProductCard'
import { PageHero } from '@/components/sections/PageHero'
import { productCategories } from '@/lib/compliance'
import { getHomePage, getProducts, getSiteSettings } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import styles from './products.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const [home, settings] = await Promise.all([getHomePage(), getSiteSettings()])
  return buildMetadata({
    path: '/products',
    settings,
    title: 'Financial Products: Mutual Funds, NPS, PMS & Insurance',
    description:
      home.products?.lead ||
      'Mutual funds, NPS, equity, PMS, loans against mutual funds and insurance from FinOracles, an AMFI-registered distributor in Satara.',
  })
}

export default async function ProductsPage() {
  const [home, products] = await Promise.all([getHomePage(), getProducts()])

  return (
    <>
      <PageHero
        eyebrow="Our Products"
        title="The right financial product for every goal"
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
            </div>
          </section>
        )
      })}
    </>
  )
}
