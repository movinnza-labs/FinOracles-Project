import type { Metadata } from 'next'
import { PageHero } from '@/components/sections/PageHero'
import { ContactSection } from '@/components/sections/ContactSection'
import { getHomePage, getProducts, getSiteSettings } from '@/lib/queries'
import { JsonLd } from '@/components/ui/JsonLd'
import { contactPageSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'

type Props = { searchParams: Promise<{ interest?: string; goal?: string }> }

/** Goals linked from the homepage "financial needs" cards, pre-filled into the message. */
const goals: Record<string, string> = {
  'child-future': "I'm planning for my child's future and would like guidance.",
  'own-home': 'I want to plan for buying a home and would like guidance.',
  retirement: "I'm preparing for retirement and would like guidance.",
  'started-earning': "I've just started earning and want to begin investing.",
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata({
    path: '/contact',
    settings,
    title: 'Contact FinOracles | Free Financial Consultation in Satara',
    // Phone and office from Site Settings, so the description always matches the contact details.
    description: `Call ${settings.phones?.[0]?.display ?? '+91 920 930 9822'}, WhatsApp or visit our office at ZP Chowk, Satara. Book a free consultation with the FinOracles financial planning team.`,
  })
}

export default async function ContactPage({ searchParams }: Props) {
  const { interest, goal } = await searchParams
  const [home, settings, products] = await Promise.all([getHomePage(), getSiteSettings(), getProducts()])
  const names = products.map((p) => p.enquiryLabel || p.name)

  return (
    <>
      <JsonLd data={contactPageSchema()} />
      <PageHero
        eyebrow="Contact Us"
        title="Book a Free Financial Consultation in Satara"
        lead={home.contact?.lead || 'Get in touch with our team for any queries or support.'}
        breadcrumbs={[{ name: 'Contact', path: '/contact' }]}
      />
      <ContactSection
        settings={settings}
        heading="Get in touch"
        lead="Share a few details and our team will call you back at your preferred time."
        formHeading="Request a Call Back"
        showMap
        defaultInterest={interest && names.includes(interest) ? interest : undefined}
        defaultMessage={goal && Object.hasOwn(goals, goal) ? goals[goal] : undefined}
      />
    </>
  )
}
