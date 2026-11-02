import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { About } from '@/components/home/About'
import { Expertise } from '@/components/home/Expertise'
import { Guidance } from '@/components/home/Guidance'
import { Hero } from '@/components/home/Hero'
import { Logins } from '@/components/home/Logins'
import { Needs } from '@/components/home/Needs'
import { ProductExplorer } from '@/components/home/ProductExplorer'
import { Resources } from '@/components/home/Resources'
import { Team } from '@/components/home/Team'
import { Tools } from '@/components/home/Tools'
import { TrustStrip } from '@/components/home/TrustStrip'
import { WhatWeDo } from '@/components/home/WhatWeDo'
import { ContactSection } from '@/components/sections/ContactSection'
import { ServiceCards } from '@/components/sections/ServiceCards'
import { StatsStrip } from '@/components/sections/StatsStrip'
import { SectionHead } from '@/components/ui/SectionHead'
import { getHomePage, getHomeServices, getProducts, getSiteSettings, getTeam } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import { telHref } from '@/lib/text'

export async function generateMetadata(): Promise<Metadata> {
  const [home, settings] = await Promise.all([getHomePage(), getSiteSettings()])
  return buildMetadata({ path: '/', settings, meta: home.meta })
}

export default async function HomePage() {
  const [home, settings, products, team, services] = await Promise.all([
    getHomePage(),
    getSiteSettings(),
    getProducts(),
    getTeam(),
    getHomeServices(),
  ])
  const phone = settings.phones?.[0]

  return (
    <>
      <Hero hero={home.hero} phone={phone ? { display: phone.display, href: telHref(phone.number) } : null} />
      <TrustStrip settings={settings} />
      <WhatWeDo data={home.whatWeDo} />
      <Needs data={home.needs} />
      <Guidance data={home.guidance} />

      {home.products?.enabled && products.length > 0 && (
        <section id="products" className="section section--tinted" aria-labelledby="products-title">
          <div className="container">
            <SectionHead id="products-title" heading={home.products.heading} lead={home.products.lead} />
            <ProductExplorer
              label={home.products.heading || 'Our Products'}
              products={products.map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                category: p.category,
                icon: p.icon,
                tagline: p.tagline,
                description: p.description,
                highlights: (p.highlights ?? []).map((h) => h.text),
                idealFor: p.idealFor,
                enquiryLabel: p.enquiryLabel,
              }))}
              contactAnchor={home.products.ctaUrl}
              whatsappNumber={settings.whatsapp?.number}
            />
          </div>
        </section>
      )}

      <About data={home.about} />
      <Team data={home.team} members={team} />
      <Expertise data={home.expertise} />

      {home.services?.enabled && services.length > 0 && (
        <section id="services" className="section" aria-labelledby="services-title">
          <div className="container">
            <div className="section-head-row">
              <SectionHead id="services-title" heading={home.services.heading} lead={home.services.lead} />
              <Link href="/services" className="btn btn--outline reveal">
                View all services
                <ArrowRight aria-hidden />
              </Link>
            </div>
            <ServiceCards services={services} />
          </div>
        </section>
      )}

      <Resources data={home.resources} />
      <Tools data={home.tools} />
      <Logins data={home.logins} settings={settings} />

      {home.contact?.enabled && (
        <ContactSection
          settings={settings}
          heading={home.contact.heading}
          lead={home.contact.lead}
          formHeading={home.contact.formHeading}
        />
      )}

      {home.stats?.enabled && <StatsStrip items={home.stats.items} />}
    </>
  )
}
