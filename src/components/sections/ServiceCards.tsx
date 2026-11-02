import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CircleCheck } from 'lucide-react'
import type { Service } from '@/payload-types'
import { IconTile } from '@/components/ui/Icon'
import { getImage } from '@/lib/media'
import styles from './ServiceCards.module.css'

/** Equal-height service cards: image, icon badge, title, summary, key features, link. */
export function ServiceCards({ services, linked = true }: { services: Service[]; linked?: boolean }) {
  return (
    <ul role="list" className={styles.services}>
      {services.map((service) => {
        const image = getImage(service.image, 'card')
        const href = linked && service.slug ? `/services/${service.slug}` : null
        return (
          <li key={service.id} className={`${styles.service} lift lift-rule reveal`}>
            <div className={styles.image}>
              {image && (
                <Image
                  src={image.src}
                  alt=""
                  width={image.width}
                  height={image.height}
                  sizes="(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 400px"
                />
              )}
            </div>

            <div className={styles.body}>
              <span className={styles.badge}>
                <IconTile name={service.icon} fallback="target" />
              </span>

              <h3 className="h4">
                {href ? (
                  <Link href={href} className={styles.link}>
                    {service.title}
                  </Link>
                ) : (
                  service.title
                )}
              </h3>
              <p className={styles.summary}>{service.summary}</p>

              {!!service.features?.length && (
                <ul role="list" className={styles.features}>
                  {service.features.map((f) => (
                    <li key={f.id ?? f.text}>
                      <CircleCheck aria-hidden />
                      {f.text}
                    </li>
                  ))}
                </ul>
              )}

              {href && (
                <span className={styles.more} aria-hidden>
                  Learn more <ArrowRight />
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
