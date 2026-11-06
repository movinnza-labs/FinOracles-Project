import Image from 'next/image'
import { CircleCheck } from 'lucide-react'
import type { HomePage } from '@/types/content'
import { getImage } from '@/lib/media'
import { noBreakHyphens, toParagraphs } from '@/lib/text'
import styles from './About.module.css'

export function About({ data }: { data: HomePage['about'] }) {
  if (!data?.enabled) return null
  const image = getImage(data.image)

  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="container two-col two-col--center">
        {image && (
          <figure className={`${styles.figure} reveal`}>
            <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 1023px) 90vw, 50vw" />
            {data.badgeValue && (
              <figcaption className={styles.badge}>
                <strong>{data.badgeValue}</strong>
                <span>{data.badgeLabel}</span>
              </figcaption>
            )}
          </figure>
        )}
        <div className="reveal">
          {data.eyebrow && <p className="eyebrow">{data.eyebrow}</p>}
          <h2 id="about-title" className="h2">
            {data.headingStart} {data.headingAccent && <span className="accent-text">{data.headingAccent}</span>}{' '}
            {data.headingEnd}
          </h2>
          {data.intro && <p className="lead-dark justify-wide">{noBreakHyphens(data.intro)}</p>}
          {toParagraphs(data.body).map((p, i) => (
            <p key={i} className={`${styles.body} justify-wide`}>
              {noBreakHyphens(p)}
            </p>
          ))}
          {!!data.values?.length && (
            <ul role="list" className={styles.values}>
              {data.values.map((v) => (
                <li key={v.id ?? v.title}>
                  <CircleCheck aria-hidden />
                  <div>
                    <h3 className="h5">{v.title}</h3>
                    {v.text && <p>{v.text}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
