import type { Metadata } from 'next'
import { About } from '@/components/home/About'
import { Expertise } from '@/components/home/Expertise'
import { Team } from '@/components/home/Team'
import { TrustStrip } from '@/components/home/TrustStrip'
import { WhatWeDo } from '@/components/home/WhatWeDo'
import { PageHero } from '@/components/sections/PageHero'
import { StatsStrip } from '@/components/sections/StatsStrip'
import { JsonLd } from '@/components/ui/JsonLd'
import { getHomePage, getSiteSettings, getTeam } from '@/lib/queries'
import { aboutPageSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata({
    path: '/about',
    settings,
    // Full title: with the " | FinOracles" suffix it would pass 60 characters, so none is added.
    title: 'About FinOracles | Financial Planning Company in Satara',
    description:
      'Meet the FinOracles team in Satara: 15+ years of experience, 6,000+ clients and goal-driven financial planning for families. Learn who we are and how we work.',
  })
}

/** About page, assembled from the same CMS sections as the homepage (edited once, shown in both). */
export default async function AboutPage() {
  const [home, settings, team] = await Promise.all([getHomePage(), getSiteSettings(), getTeam()])

  return (
    <>
      <JsonLd data={aboutPageSchema(team.find((m) => m.isLeader))} />
      <PageHero
        eyebrow="About Us"
        title={`About ${settings.legalName}`}
        lead={settings.defaultDescription}
        breadcrumbs={[{ name: 'About Us', path: '/about' }]}
      />
      <TrustStrip settings={settings} />
      <About data={home.about} />
      <WhatWeDo data={home.whatWeDo} />
      <Expertise data={home.expertise} />
      <Team data={home.team} members={team} cta={{ label: 'Book a Free Consultation', url: '/contact' }} />
      {home.stats?.enabled && <StatsStrip items={home.stats.items} />}
    </>
  )
}
