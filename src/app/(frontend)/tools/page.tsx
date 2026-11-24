import type { Metadata } from 'next'
import { Tools } from '@/components/home/Tools'
import { PageHero } from '@/components/sections/PageHero'
import { Calculators } from '@/components/tools/Calculators'
import { JsonLd } from '@/components/ui/JsonLd'
import { getHomePage, getSiteSettings } from '@/lib/queries'
import { calculatorsSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata({
    path: '/tools',
    settings,
    title: 'SIP Calculator, Lumpsum & Goal Calculator | FinOracles',
    description:
      'Free SIP, lumpsum and goal calculators. See how your monthly investment could grow and how much to invest to reach your goal. Try it now.',
  })
}

export default async function ToolsPage() {
  const home = await getHomePage()
  return (
    <>
      <JsonLd data={calculatorsSchema()} />
      <PageHero
        eyebrow="Financial Tools"
        title="SIP, Lumpsum & Goal Calculators"
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
