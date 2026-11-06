import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { HomePage } from '@/types/content'
import { Icon } from '@/components/ui/Icon'
import { getImage } from '@/lib/media'
import { Paragraphs } from '@/lib/text'
import styles from './Needs.module.css'

export function Needs({ data }: { data: HomePage['needs'] }) {
  if (!data?.enabled || !data.items?.length) return null
  return (
    <section className="section section--tinted" aria-labelledby="needs">
      <div className="container">
        <div className="split reveal">
          <h2 id="needs" className="h2">
            {data.heading}
          </h2>
          {data.lead && (
            <div className="lead">
              <Paragraphs text={data.lead} />
            </div>
          )}
        </div>
        <ul role="list" className={styles.needs}>
          {data.items.map((item) => {
            const image = getImage(item.image, 'thumbnail')
            return (
              <li key={item.id ?? item.title} className={`${styles.need} card lift lift-rule reveal`}>
                <span className={styles.media}>
                  {image ? (
                    <Image src={image.src} alt="" width={72} height={72} sizes="72px" />
                  ) : (
                    <Icon icon={item.icon} fallback="sprout" />
                  )}
                </span>
                <h3>
                  {item.url ? (
                    <Link href={item.url} className={styles.link}>
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </h3>
                {item.url && <ArrowRight aria-hidden className={styles.arrow} />}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
