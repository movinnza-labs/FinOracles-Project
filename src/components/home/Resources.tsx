import type { HomePage } from '@/types/content'
import { CmsLink } from '@/components/ui/CmsLink'
import { IconTile } from '@/components/ui/Icon'
import { SectionHead } from '@/components/ui/SectionHead'
import { isExternal } from '@/lib/url'
import styles from './Resources.module.css'

export function Resources({ data }: { data: HomePage['resources'] }) {
  if (!data?.enabled || !data.items?.length) return null
  return (
    <section id="resources" className="section section--tinted" aria-labelledby="resources-title">
      <div className="container">
        <SectionHead id="resources-title" heading={data.heading} lead={data.lead} />
        <ul role="list" className={styles.grid}>
          {data.items.map((item) => (
            <li key={item.id ?? item.title} className="card lift lift-rule reveal">
              <IconTile name={item.icon} />
              <h3 className="h4">
                {item.url ? (
                  <CmsLink
                    link={{ label: item.title, url: item.url, newTab: isExternal(item.url) }}
                    className={styles.link}
                  />
                ) : (
                  item.title
                )}
              </h3>
              {item.text && <p>{item.text}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
