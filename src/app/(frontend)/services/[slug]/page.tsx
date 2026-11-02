import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContactSection } from '@/components/sections/ContactSection'
import { PageHero } from '@/components/sections/PageHero'
import { IconTile } from '@/components/ui/Icon'
import { JsonLd } from '@/components/ui/JsonLd'
import { RichText } from '@/components/ui/RichText'
import { getImage } from '@/lib/media'
import { getServiceBySlug, getServices, getSiteSettings } from '@/lib/queries'
import { serviceSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import styles from './service.module.css'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [service, settings] = await Promise.all([getServiceBySlug(slug), getSiteSettings()])
  if (!service) return { title: 'Service not found', robots: { index: false } }
  return buildMetadata({
    path: `/services/${service.slug}`,
    settings,
    meta: service.meta,
    title: service.title,
    description: service.summary,
    image: service.image,
  })
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const [service, services, settings] = await Promise.all([getServiceBySlug(slug), getServices(), getSiteSettings()])
  if (!service) notFound()

  const image = getImage(service.image, 'card')
  const others = services.filter((s) => s.id !== service.id)

  return (
    <>
      <JsonLd data={serviceSchema(service)} />
      <PageHero
        eyebrow="Our Services"
        title={service.title}
        lead={service.summary}
        breadcrumbs={[
          { name: 'Services', path: '/services' },
          { name: service.title, path: `/services/${service.slug}` },
        ]}
      />
      <section className="section">
        <div className={`container ${styles.layout}`}>
          <article className="reveal">
            {service.content ? <RichText data={service.content} /> : <p className="lead">{service.summary}</p>}
          </article>
          <aside className={styles.aside}>
            {image && (
              <div className={styles.image}>
                <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 1023px) 92vw, 380px" />
              </div>
            )}
            {others.length > 0 && (
              <nav aria-label="Other services" className={styles.others}>
                <h2 className="h5">Other services</h2>
                <ul role="list">
                  {others.map((s) => (
                    <li key={s.id}>
                      <Link href={`/services/${s.slug}`}>
                        <IconTile name={s.icon} fallback="target" />
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </aside>
        </div>
      </section>
      <ContactSection settings={settings} heading="Talk to our team" lead="Tell us about your goals and we will get back to you." />
    </>
  )
}
