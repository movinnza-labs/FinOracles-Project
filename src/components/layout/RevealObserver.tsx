'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Progressive scroll-reveal: elements with `.reveal` fade/slide in when they
 * enter the viewport. Content stays visible without JS (class added here), and
 * anything already on screen is revealed immediately rather than waiting for
 * the first IntersectionObserver callback.
 */
export function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.documentElement
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return
    }

    const show = (el: Element) => el.classList.add('is-visible')
    const pending = Array.from(document.querySelectorAll('.reveal:not(.is-visible)'))
    const fold = window.innerHeight * 0.95

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show(entry.target)
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0 },
    )

    for (const el of pending) {
      if (el.getBoundingClientRect().top < fold) show(el)
      else observer.observe(el)
    }
    root.classList.add('js-reveal')

    return () => observer.disconnect()
  }, [pathname])

  return null
}
