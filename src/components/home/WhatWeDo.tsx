import type { HomePage } from '@/types/content'
import { IconTile } from '@/components/ui/Icon'
import { SectionHead } from '@/components/ui/SectionHead'
import styles from './WhatWeDo.module.css'

export function WhatWeDo({ data }: { data: HomePage['whatWeDo'] }) {
  if (!data?.enabled || !data.items?.length) return null
  return (
    <section className="section" aria-labelledby="what-we-do">
      <div className="container">
        <SectionHead id="what-we-do" heading={data.heading} />
        <ol className={styles.pillars}>
          {data.items.map((item) => (
            <li key={item.id ?? item.title} className="reveal icon-host">
              <IconTile name={item.icon} />
              <h3 className="h4">{item.title}</h3>
              {item.text && <p>{item.text}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
