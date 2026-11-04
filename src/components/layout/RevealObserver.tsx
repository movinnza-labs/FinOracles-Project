'use client'

import { useEffect } from 'react'

/**
 * Progressive scroll-reveal: elements with `.reveal` fade/slide in when they
 * enter the viewport. Content stays visible without JS (class added here), and
 * anything already on screen is revealed immediately rather than waiting for
 * the first IntersectionObserver callback. New `.reveal` elements added later
 * (client navigation, including query-string changes like /blog?page=2) are
 * picked up by a MutationObserver.
 */
export function RevealObserver() {
  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return
    }

    const show = (el: Element) => el.classList.add('is-visible')

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

    const scan = () => {
      const fold = window.innerHeight * 0.95
      for (const el of document.querySelectorAll('.reveal:not(.is-visible)')) {
        if (el.getBoundingClientRect().top < fold) show(el)
        else observer.observe(el)
      }
    }

    scan()
    document.documentElement.classList.add('js-reveal')

    let frame = 0
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(scan)
    })
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(frame)
      mutations.disconnect()
      observer.disconnect()
    }
  }, [])

  return null
}
