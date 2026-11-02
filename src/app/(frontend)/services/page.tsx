import type { Metadata } from 'next'
import { ContactSection } from '@/components/sections/ContactSection'
import { PageHero } from '@/components/sections/PageHero'
import { ServiceCards } from '@/components/sections/ServiceCards'
import { getHomePage, getServices, getSiteSettings } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const [home, settings] = await Promise.all([getHomePage(), getSiteSettings()])
  return buildMetadata({
    path: '/services',
    settings,
    title: home.services?.heading || 'Our Services',
    description: home.services?.lead,
  })
}

export default async function ServicesPage() {
  const [home, services, settings] = await Promise.all([getHomePage(), getServices(), getSiteSettings()])
  const title = home.services?.heading || 'Our Services'

  return (
    <>
      <PageHero title={title} lead={home.services?.lead} breadcrumbs={[{ name: title, path: '/services' }]} />
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
