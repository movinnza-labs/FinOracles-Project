'use client'

import Image from 'next/image'
import { useEffect, useId, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { ChevronDown } from 'lucide-react'
import type { ImageData } from '@/lib/media'
import styles from './Hero.module.css'

export type GoalSlide = {
  image: ImageData
  title: string
  titleAccent?: string | null
  description?: string | null
  more: string[]
}

const INTERVAL = 5000

type GoalCarouselProps = {
  slides: GoalSlide[]
  /** Controlled by HeroRotator so the hero headline changes in step. */
  index: number
  onIndexChange: Dispatch<SetStateAction<number>>
}

/** Auto-rotating goal card in the hero. Pauses on hover and while expanded. */
export function GoalCarousel({ slides, index, onIndexChange: setIndex }: GoalCarouselProps) {
  const [open, setOpen] = useState(false)
  const [paused, setPaused] = useState(false)
  const moreId = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open || paused || slides.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL)
    return () => window.clearInterval(timer)
  }, [open, paused, slides.length, setIndex])

  // Stop rotating while the hero is off-screen.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setPaused(!entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const slide = slides[index]

  return (
    <div
      ref={rootRef}
      className={`${styles.goalCard} ${open ? styles.goalOpen : ''}`}
      aria-roledescription="carousel"
      aria-label="Highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.goalMedia}>
        {slides.map((s, i) => (
          <Image
            key={i}
            src={s.image.src}
            alt={i === index ? s.image.alt : ''}
            width={s.image.width}
            height={s.image.height}
            sizes="(max-width: 1023px) 90vw, 470px"
            priority={i === 0}
            className={`${styles.goalPhoto} ${i === index ? styles.goalPhotoOn : ''}`}
          />
        ))}
      </div>

      <div className={styles.goalBody} aria-live={paused ? 'polite' : 'off'}>
        <p className={styles.goalTitle}>
          {slide.title} {slide.titleAccent && <span>{slide.titleAccent}</span>}
        </p>
        {slide.description && <p className={styles.goalText}>{slide.description}</p>}
        {slide.more.length > 0 && (
          <>
            <button
              type="button"
              className="text-button"
              aria-expanded={open}
              aria-controls={moreId}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? 'SHOW LESS' : 'LEARN MORE'}
              <ChevronDown aria-hidden className={open ? styles.flip : undefined} />
            </button>
            <div id={moreId} className={styles.goalMore} hidden={!open}>
              {slide.more.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
