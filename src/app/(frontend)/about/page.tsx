import type { Metadata } from 'next'
import { About } from '@/components/home/About'
import { Expertise } from '@/components/home/Expertise'
import { Team } from '@/components/home/Team'
import { TrustStrip } from '@/components/home/TrustStrip'
import { WhatWeDo } from '@/components/home/WhatWeDo'
import { PageHero } from '@/components/sections/PageHero'
import { StatsStrip } from '@/components/sections/StatsStrip'
import { getHomePage, getSiteSettings, getTeam } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const [home, settings] = await Promise.all([getHomePage(), getSiteSettings()])
  return buildMetadata({
    path: '/about',
    settings,
    title: 'About FinOracles Services Pvt. Ltd., Satara',
    description: home.about?.intro || settings.defaultDescription,
  })
}

/** About page, assembled from the same CMS sections as the homepage (edited once, shown in both). */
export default async function AboutPage() {
  const [home, settings, team] = await Promise.all([getHomePage(), getSiteSettings(), getTeam()])

  return (
    <>
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
      <Team data={home.team} members={team} />
      {home.stats?.enabled && <StatsStrip items={home.stats.items} />}
    </>
  )
}
