import type { Metadata } from 'next'
import { Tools } from '@/components/home/Tools'
import { PageHero } from '@/components/sections/PageHero'
import { Calculators } from '@/components/tools/Calculators'
import { getHomePage, getSiteSettings } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata({
    path: '/tools',
    settings,
    title: 'SIP, Lumpsum & Goal Calculators',
    description:
      'Free SIP, lumpsum and goal planning calculators. Estimate how your investments could grow and how much to invest for your goals.',
  })
}

export default async function ToolsPage() {
  const home = await getHomePage()
  return (
    <>
      <PageHero
        eyebrow="Financial Tools"
        title="Plan your investments with our calculators"
        lead="Estimate how a SIP or lumpsum could grow, or find out how much you need to invest each month to reach a goal."
        breadcrumbs={[{ name: 'Tools', path: '/tools' }]}
      />
      <section className="section">
        <div className="container">
          <Calculators />
        </div>
      </section>
      {/* Link to the wider set of partner calculators, managed in Homepage → Tools */}
      <Tools data={home.tools ? { ...home.tools, heading: 'More calculators', lead: 'Retirement, education, EMI and other planning tools from our partner platform.' } : home.tools} />
    </>
  )
}
