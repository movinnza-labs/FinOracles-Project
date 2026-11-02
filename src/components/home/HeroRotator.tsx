'use client'

import { useState, type ReactNode } from 'react'
import { GoalCarousel, type GoalSlide } from './GoalCarousel'
import styles from './Hero.module.css'

export type HeroSlide = GoalSlide & { headline: string; lead?: string | null }

type HeroRotatorProps = {
  slides: HeroSlide[]
  /** Visually hidden lead-in for the h1 (brand + tagline for SEO and screen readers). */
  titlePrefix?: string | null
  badge?: ReactNode
  actions?: ReactNode
  figures?: ReactNode
}

/**
 * Hero text column + goal card driven by one slide index, so the headline and
 * intro change together with the rotating card. All headlines are stacked in
 * one grid cell, so the block is sized to the longest and nothing below shifts.
 */
export function HeroRotator({ slides, titlePrefix, badge, actions, figures }: HeroRotatorProps) {
  const [index, setIndex] = useState(0)
  const hasLeads = slides.some((s) => s.lead)

  return (
    <>
      <div>
        {badge}
        <h1 id="hero-title" className={styles.title}>
          {titlePrefix && <span className="sr-only">{titlePrefix} </span>}
          <span className={styles.stack}>
            {slides.map((s, i) => (
              <span
                key={i}
                className={`${styles.stackItem} ${i === index ? styles.stackItemOn : ''}`}
                aria-hidden={i !== index}
              >
                {s.headline}
              </span>
            ))}
          </span>
        </h1>
        {hasLeads && (
          <div className={`${styles.lead} ${styles.stack}`}>
            {slides.map((s, i) => (
              <p
                key={i}
                className={`${styles.stackItem} ${i === index ? styles.stackItemOn : ''}`}
                aria-hidden={i !== index}
              >
                {s.lead}
              </p>
            ))}
          </div>
        )}
        {actions}
        {figures}
      </div>

      <GoalCarousel slides={slides} index={index} onIndexChange={setIndex} />
    </>
  )
}
