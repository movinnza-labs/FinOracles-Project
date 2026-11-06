import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import type { Page, SiteSetting } from '@/types/content'
import { PostCard, PostGrid } from '@/components/blog/PostCard'
import { ContactSection } from '@/components/sections/ContactSection'
import { ServiceCards } from '@/components/sections/ServiceCards'
import { StatsStrip } from '@/components/sections/StatsStrip'
import { ButtonLink, CmsLink } from '@/components/ui/CmsLink'
import { IconTile } from '@/components/ui/Icon'
import { JsonLd } from '@/components/ui/JsonLd'
import { RichText } from '@/components/ui/RichText'
import { SectionHead } from '@/components/ui/SectionHead'
import { getImage } from '@/lib/media'
import { getLatestPosts, getServices } from '@/lib/queries'
import { faqSchema } from '@/lib/schema'
import styles from './Blocks.module.css'

type Block = NonNullable<Page['layout']>[number]

const sectionClass = (background?: string | null) =>
  ['section', background === 'tinted' && 'section--tinted', background === 'navy' && 'section--navy']
    .filter(Boolean)
    .join(' ')

async function BlockView({ block, settings }: { block: Block; settings: SiteSetting }) {
  switch (block.blockType) {
    case 'content':
      return (
        <section className={sectionClass(block.background)}>
          <div className={`container ${block.width === 'narrow' ? 'container--narrow' : ''}`}>
            <SectionHead eyebrow={block.eyebrow} heading={block.heading} lead={block.lead} />
            <RichText data={block.body} className="reveal" />
          </div>
        </section>
      )

    case 'mediaContent': {
      const image = getImage(block.image, 'card')
      return (
        <section className={sectionClass(block.background)}>
          <div className={`container two-col two-col--center ${block.imagePosition === 'right' ? styles.flip : ''}`}>
            {image && (
              <figure className={`${styles.figure} reveal`}>
                <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 1023px) 92vw, 560px" />
              </figure>
            )}
            <div className="reveal">
              {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
              {block.heading && <h2 className="h2">{block.heading}</h2>}
              {block.lead && <p className="lead">{block.lead}</p>}
              <RichText data={block.body} />
              {!!block.links?.length && (
                <div className={styles.actions}>
                  {block.links.map((link, i) => (
                    <ButtonLink key={link.id ?? i} link={link} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )
    }

    case 'cards':
      return (
        <section className={sectionClass(block.background)}>
          <div className="container">
            <SectionHead eyebrow={block.eyebrow} heading={block.heading} lead={block.lead} />
            <ul role="list" className={styles.cards} data-columns={block.columns ?? '3'}>
              {block.cards?.map((card, i) => (
                <li key={card.id ?? i} className="card lift lift-rule reveal">
                  {card.icon && <IconTile name={card.icon} />}
                  <h3 className="h4">
                    {card.link?.url ? (
                      <CmsLink link={{ ...card.link, label: card.title }} className={styles.cardLink} />
                    ) : (
                      card.title
                    )}
                  </h3>
                  {card.text && <p>{card.text}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )

    case 'servicesGrid': {
      const services = await getServices()
      return (
        <section className={sectionClass(block.background)}>
          <div className="container">
            <SectionHead eyebrow={block.eyebrow} heading={block.heading} lead={block.lead} />
            <ServiceCards services={services} />
          </div>
        </section>
      )
    }

    case 'stats':
      return <StatsStrip items={block.items} />

    case 'faq':
      return (
        <section className={sectionClass(block.background)}>
          <JsonLd data={faqSchema(block.items ?? [])} />
          <div className="container container--narrow">
            <SectionHead eyebrow={block.eyebrow} heading={block.heading} lead={block.lead} />
            <div className={styles.faq}>
              {block.items?.map((item, i) => (
                <details key={item.id ?? i} className="reveal">
                  <summary>
                    {item.question}
                    <ChevronDown aria-hidden />
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )

    case 'latestPosts': {
      const docs = await getLatestPosts(block.limit ?? 3)
      if (!docs.length) return null
      return (
        <section className={sectionClass(block.background)}>
          <div className="container">
            <SectionHead eyebrow={block.eyebrow} heading={block.heading} lead={block.lead} />
            <PostGrid>
              {docs.map((post) => (
                <PostCard key={post.id} post={post} headingLevel="h3" />
              ))}
            </PostGrid>
          </div>
        </section>
      )
    }

    case 'cta':
      return (
        <section className="section">
          <div className="container">
            <div className={`${styles.cta} reveal`}>
              <div>
                <h2 className="h2">{block.heading}</h2>
                {block.text && <p className="lead">{block.text}</p>}
              </div>
              {!!block.links?.length && (
                <div className={styles.actions}>
                  {block.links.map((link, i) => (
                    <ButtonLink key={link.id ?? i} link={link} variant={link.style === 'outline' ? 'onDark' : link.style} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )

    case 'enquiryForm':
      return (
        <ContactSection
          id="enquiry"
          settings={settings}
          heading={block.heading}
          lead={block.lead}
          formHeading={block.formHeading}
          showDetails={block.showContactDetails ?? true}
        />
      )

    default:
      return null
  }
}

export function RenderBlocks({ blocks, settings }: { blocks?: Page['layout']; settings: SiteSetting }) {
  if (!blocks?.length) return null
  return blocks.map((block, i) => <BlockView key={block.id ?? i} block={block} settings={settings} />)
}
