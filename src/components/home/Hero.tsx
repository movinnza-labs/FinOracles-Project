import { BadgeCheck, Phone } from 'lucide-react'
import type { HomePage } from '@/payload-types'
import { ButtonLink } from '@/components/ui/CmsLink'
import { getImage } from '@/lib/media'
import { toParagraphs } from '@/lib/text'
import { HeroRotator, type HeroSlide } from './HeroRotator'
import styles from './Hero.module.css'

type HeroProps = {
  hero: HomePage['hero']
  phone?: { display: string; href: string } | null
}

export function Hero({ hero, phone }: HeroProps) {
  // Each slide carries its own headline + intro; empty fields fall back to the main hero text.
  const slides: HeroSlide[] = (hero.slides ?? []).flatMap((s) => {
    const image = getImage(s.image)
    return image
      ? [
          {
            image,
            title: s.title,
            titleAccent: s.titleAccent,
            description: s.description,
            more: toParagraphs(s.more),
            headline: s.headline || hero.title,
            lead: s.lead || hero.lead,
          },
        ]
      : []
  })

  const badge = hero.badgeText ? (
    <p className={styles.badge}>
      <BadgeCheck aria-hidden />
      {hero.badgeText}
      {hero.badgeHighlight && <span>{hero.badgeHighlight}</span>}
    </p>
  ) : null

  const actions = (
    <div className={styles.actions}>
      {hero.primaryCta?.url && <ButtonLink link={hero.primaryCta} variant="primary" />}
      {hero.showPhoneButton && phone && (
        <a href={phone.href} className="btn btn--onDark">
          <Phone aria-hidden />
          {phone.display}
        </a>
      )}
    </div>
  )

  const figures = hero.figures?.length ? (
    <dl className={styles.figures}>
      {hero.figures.map((f) => (
        <div key={f.id ?? f.label}>
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  ) : null

  return (
    <section id="home" className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.grid}`}>
        {slides.length > 0 ? (
          <HeroRotator slides={slides} titlePrefix={hero.titlePrefix} badge={badge} actions={actions} figures={figures} />
        ) : (
          <div>
            {badge}
            <h1 id="hero-title" className={styles.title}>
              {hero.titlePrefix && <span className="sr-only">{hero.titlePrefix} </span>}
              {hero.title}
            </h1>
            {hero.lead && <p className={styles.lead}>{hero.lead}</p>}
            {actions}
            {figures}
          </div>
        )}
      </div>
    </section>
  )
}
