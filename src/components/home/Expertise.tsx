import Image from 'next/image'
import { Quote } from 'lucide-react'
import type { HomePage } from '@/types/content'
import { Icon } from '@/components/ui/Icon'
import { getImage } from '@/lib/media'
import { Paragraphs } from '@/lib/text'
import styles from './Expertise.module.css'

export function Expertise({ data }: { data: HomePage['expertise'] }) {
  if (!data?.enabled) return null
  const image = getImage(data.image, 'card')
  const vision = data.vision

  return (
    <section className="section section--navy" aria-labelledby="expertise">
      <div className={`container ${styles.grid}`}>
        <div className="reveal">
          <h2 id="expertise" className="h2">
            {data.heading}
          </h2>
          {data.lead && <p className="lead">{data.lead}</p>}
          {!!data.items?.length && (
            <ul role="list" className={styles.list}>
              {data.items.map((item) => (
                <li key={item.id ?? item.label}>
                  <Icon icon={item.icon} />
                  {item.label}
                </li>
              ))}
            </ul>
          )}
          <Paragraphs text={data.body} />
        </div>

        <div className={styles.side}>
          {image && (
            <div className={`${styles.image} reveal`}>
              <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 1023px) 90vw, 520px" />
            </div>
          )}
          {vision?.text && (
            <div className={`${styles.vision} reveal`} role="region" aria-labelledby="vision">
              <Quote aria-hidden className={styles.quoteIcon} />
              <h2 id="vision" className="h4">
                {vision.heading}
              </h2>
              <p>{vision.text}</p>
              {vision.tagline && <p className={styles.tagline}>{vision.tagline}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
