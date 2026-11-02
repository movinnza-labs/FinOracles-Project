import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { RevealObserver } from '@/components/layout/RevealObserver'
import { Disclaimer, WhatsAppButton } from '@/components/layout/SiteExtras'
import { JsonLd } from '@/components/ui/JsonLd'
import { getImage } from '@/lib/media'
import { getFooter, getHeader, getSiteSettings } from '@/lib/queries'
import { organizationSchema, websiteSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { telHref } from '@/lib/text'
import { getServerURL } from '@/lib/url'
import '@/styles/tokens.css'
import '@/styles/base.css'
import '@/styles/ui.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

// Content is served from the CMS on each request (cached per tag, see lib/queries.ts),
// so builds never need database access and edits go live immediately.
export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  themeColor: '#0f2a47',
  width: 'device-width',
  initialScale: 1,
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    metadataBase: new URL(getServerURL()),
    applicationName: settings.siteName,
    ...buildMetadata({ path: '/', settings }),
    formatDetection: { telephone: false },
  }
}

export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const [settings, header, footer] = await Promise.all([getSiteSettings(), getHeader(), getFooter()])
  const phone = settings.phones?.[0]

  return (
    <html lang="en-IN" className={jakarta.variable}>
      <body>
        <JsonLd data={[organizationSchema(settings), websiteSchema(settings)]} />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="scroll-progress" aria-hidden />
        <Header
          logo={getImage(settings.logo)}
          siteName={settings.siteName}
          navItems={header.navItems ?? []}
          cta={header.cta}
          phone={header.showPhone && phone ? { display: phone.display, href: telHref(phone.number) } : null}
        />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Disclaimer text={settings.disclaimer} />
        <Footer footer={footer} settings={settings} />
        <WhatsAppButton
          number={settings.whatsapp?.number}
          message={settings.whatsapp?.message}
          siteName={settings.siteName}
        />
        <RevealObserver />
      </body>
    </html>
  )
}
