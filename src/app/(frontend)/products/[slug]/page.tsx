import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ChevronDown, CircleCheck, Info, Phone, Users } from 'lucide-react'
import { EnquiryForm } from '@/components/forms/EnquiryForm'
import { ProductCard, ProductGrid } from '@/components/products/ProductCard'
import { PageHero } from '@/components/sections/PageHero'
import { Icon } from '@/components/ui/Icon'
import { JsonLd } from '@/components/ui/JsonLd'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { complianceNotes, productCategories } from '@/lib/compliance'
import { getHomePage, getProductBySlug, getProducts, getSiteSettings } from '@/lib/queries'
import { faqSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { telHref } from '@/lib/text'
import { absoluteURL } from '@/lib/url'
import styles from './product.module.css'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export async function generateStaticParams() {
  return (await getProducts()).filter((p) => p.slug).map((p) => ({ slug: p.slug as string }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()])
  if (!product) return { title: 'Product not found', robots: { index: false } }
  return buildMetadata({
    path: `/products/${product.slug}`,
    settings,
    meta: product.meta,
    title: `${product.name} in Satara`,
    description: product.description,
    image: product.image,
  })
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const [product, products, settings, home] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
    getSiteSettings(),
    getHomePage(),
  ])
  if (!product) notFound()

  const shortName = product.enquiryLabel || product.name
  const category = productCategories.find((c) => c.value === product.category)
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3)
  const phone = settings.phones?.[0]
  const wa = settings.whatsapp?.number
  const waHref = wa
    ? `https://wa.me/${wa.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello FinOracles, I would like to know more about ${shortName}.`)}`
    : null
  const steps = home.guidance?.steps ?? []
  const faqs = product.faqs ?? []

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: product.name,
          serviceType: category?.label,
          description: product.description,
          provider: { '@id': absoluteURL('/#organization') },
          areaServed: 'IN',
          url: absoluteURL(`/products/${product.slug}`),
        }}
      />
      {faqs.length > 0 && <JsonLd data={faqSchema(faqs)} />}

      <PageHero
        eyebrow={category?.label ?? 'Products'}
        title={product.name}
        lead={product.tagline}
        breadcrumbs={[
          { name: 'Products', path: '/products' },
          { name: product.name, path: `/products/${product.slug}` },
        ]}
      >
        <div className={styles.heroActions}>
          <a href="#enquire" className="btn btn--primary">
            Talk to an Expert <ArrowRight aria-hidden />
          </a>
          {phone && (
            <a href={telHref(phone.number)} className="btn btn--onDark">
              <Phone aria-hidden /> {phone.display}
            </a>
          )}
          {waHref && (
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn--onDark">
              <SocialIcon platform="whatsapp" size={18} /> WhatsApp
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </PageHero>

      <section className="section">
        <div className={`container ${styles.layout}`}>
          <div className={styles.main}>
            <div className="reveal">
              <h2 className="h3">Overview</h2>
              <p className={`${styles.description} justify-wide`}>{product.description}</p>
              {product.idealFor && (
                <p className={styles.ideal}>
                  <Users aria-hidden />
                  <span>
                    <strong>Ideal for:</strong> {product.idealFor}
                  </span>
                </p>
              )}
            </div>

            {!!product.highlights?.length && (
              <div className={`${styles.panel} reveal`}>
                <h2 className="h4">Key highlights</h2>
                <ul role="list" className={styles.highlights}>
                  {product.highlights.map((h) => (
                    <li key={h.id ?? h.text}>
                      <CircleCheck aria-hidden />
                      {h.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {steps.length > 0 && (
              <div className="reveal">
                <h2 className="h4">How we help you</h2>
                <ol className={styles.steps}>
                  {steps.map((step, i) => (
                    <li key={step.id ?? step.title}>
                      <span className={styles.stepIcon}>
                        <Icon icon={step.icon} />
                      </span>
                      <div>
                        <p className={styles.stepTitle}>
                          <span>{String(i + 1).padStart(2, '0')}</span> {step.title}
                        </p>
                        {step.text && <p>{step.text}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {faqs.length > 0 && (
              <div className="reveal">
                <h2 className="h4">Frequently asked questions</h2>
                <div className={styles.faq}>
                  {faqs.map((f, i) => (
                    <details key={f.id ?? i} open={i === 0}>
                      <summary>
                        {f.question}
                        <ChevronDown aria-hidden />
                      </summary>
                      <p>{f.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {complianceNotes[product.category] && (
              <p className={styles.note}>
                <Info aria-hidden />
                {complianceNotes[product.category]}
              </p>
            )}
          </div>

          <aside id="enquire" className={styles.aside} aria-label={`Enquire about ${shortName}`}>
            <EnquiryForm
              heading={`Talk to an expert about ${shortName}`}
              interestOptions={products.map((p) => p.enquiryLabel || p.name)}
              defaultInterest={shortName}
            />
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--tinted" aria-labelledby="related-products">
          <div className="container">
            <div className="section-head-row">
              <div className="section-head">
                <p className="eyebrow">{category?.label}</p>
                <h2 id="related-products" className="h2">
                  Related products
                </h2>
              </div>
              <Link href="/products" className="btn btn--outline">
                All products <ArrowRight aria-hidden />
              </Link>
            </div>
            <ProductGrid>
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </ProductGrid>
          </div>
        </section>
      )}
    </>
  )
}
