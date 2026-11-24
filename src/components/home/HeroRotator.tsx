'use client'

import { useState, type ReactNode } from 'react'
import { GoalCarousel, type GoalSlide } from './GoalCarousel'
import styles from './Hero.module.css'

export type HeroSlide = GoalSlide & { headline: string; lead?: string | null }

type HeroRotatorProps = {
  slides: HeroSlide[]
  /** The page's h1 (main keyword), shown as a small line above the rotating headline. */
  titlePrefix?: string | null
  badge?: ReactNode
  actions?: ReactNode
  figures?: ReactNode
}

/**
 * Hero text column + goal card driven by one slide index, so the headline and
 * intro change together with the rotating card. All headlines are stacked in
 * one grid cell, so the block is sized to the longest and nothing below shifts.
 * The h1 is the static titlePrefix; the rotating headlines are not headings, so search
 * engines read one clear page heading instead of every slogan joined together.
 * Without a titlePrefix the headline stack is the h1, as before.
 */
export function HeroRotator({ slides, titlePrefix, badge, actions, figures }: HeroRotatorProps) {
  const [index, setIndex] = useState(0)
  const hasLeads = slides.some((s) => s.lead)
  const Headline = titlePrefix ? 'p' : 'h1'

  return (
    <>
      <div>
        {badge}
        {titlePrefix && (
          <h1 id="hero-title" className={styles.heading}>
            {titlePrefix}
          </h1>
        )}
        <Headline id={titlePrefix ? undefined : 'hero-title'} className={styles.title}>
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
        </Headline>
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
