import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ContactSection } from '@/components/sections/ContactSection'
import { PageHero } from '@/components/sections/PageHero'
import { ServiceCards } from '@/components/sections/ServiceCards'
import { getHomePage, getServices, getSiteSettings } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'

const TITLE = 'Our Wealth Management Services'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata({
    path: '/services',
    settings,
    title: 'Wealth Management Services in Satara | FinOracles',
    description:
      "Client Desk, E-Wealth account and recommended mutual fund portfolios: one platform to track, manage and grow your family's wealth with FinOracles.",
  })
}

export default async function ServicesPage() {
  const [home, services, settings] = await Promise.all([getHomePage(), getServices(), getSiteSettings()])

  return (
    <>
      <PageHero
        eyebrow={home.services?.heading || 'Our Services'}
        title={TITLE}
        lead={home.services?.lead}
        breadcrumbs={[{ name: 'Services', path: '/services' }]}
      >
        <p>
          <Link href="/products" className="btn btn--onDark">
            See all the products we offer
            <ArrowRight aria-hidden />
          </Link>
        </p>
      </PageHero>
      <section className="section">
        <div className="container">
          <ServiceCards services={services} />
        </div>
      </section>
      <ContactSection
        settings={settings}
        heading={home.contact?.heading}
        lead={home.contact?.lead}
        formHeading={home.contact?.formHeading}
      />
    </>
  )
}
