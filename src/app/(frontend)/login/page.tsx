import type { Metadata } from 'next'
import { Logins } from '@/components/home/Logins'
import { PageHero } from '@/components/sections/PageHero'
import { getHomePage, getSiteSettings } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    ...buildMetadata({
      path: '/login',
      settings,
      title: 'Client & Partner Login',
      description: 'Secure login links for FinOracles clients, partners and employees.',
    }),
    // Utility page: keep it out of search results.
    robots: { index: false, follow: true },
  }
}

export default async function LoginPage() {
  const [home, settings] = await Promise.all([getHomePage(), getSiteSettings()])
  return (
    <>
      <PageHero
        eyebrow="Client Login"
        title={home.logins?.heading || 'Access Your Account'}
        lead={home.logins?.lead}
        breadcrumbs={[{ name: 'Login', path: '/login' }]}
      />
      <Logins data={home.logins ? { ...home.logins, heading: null, lead: null, enabled: true } : home.logins} settings={settings} />
    </>
  )
}
