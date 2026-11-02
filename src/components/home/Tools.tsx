import type { HomePage } from '@/payload-types'
import { ButtonLink } from '@/components/ui/CmsLink'
import { IconTile } from '@/components/ui/Icon'
import styles from './Tools.module.css'

export function Tools({ data }: { data: HomePage['tools'] }) {
  if (!data?.enabled) return null
  const card = data.card
  return (
    <section id="tools" className="section" aria-labelledby="tools-title">
      <div className="container">
        <div className={`${styles.band} reveal`}>
          <div>
            <h2 id="tools-title" className="h2">
              {data.heading}
            </h2>
            {data.lead && <p className="lead">{data.lead}</p>}
          </div>
          {card?.title && (
            <div className={`${styles.card} lift lift-rule`}>
              <IconTile name={card.icon} fallback="calculator" />
              <h3 className="h4">{card.title}</h3>
              {card.text && <p>{card.text}</p>}
              {card.url && <ButtonLink link={card} variant="primary" arrow />}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
