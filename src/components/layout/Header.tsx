'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useId, useState } from 'react'
import { Menu, Phone, X } from 'lucide-react'
import { CmsLink, type LinkData } from '@/components/ui/CmsLink'
import type { ImageData } from '@/lib/media'
import styles from './Header.module.css'

type HeaderProps = {
  logo: ImageData | null
  siteName: string
  navItems: LinkData[]
  cta?: LinkData | null
  phone?: { display: string; href: string } | null
}

export function Header({ logo, siteName, navItems, cta, phone }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuId = useId()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onResize = () => window.innerWidth >= 1024 && setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.bar}`}>
        <Link href="/" className={styles.brand} aria-label={`${siteName} home`}>
          {logo ? (
            <Image src={logo.src} alt={logo.alt || siteName} width={logo.width} height={logo.height} priority />
          ) : (
            <span className={styles.wordmark}>{siteName}</span>
          )}
        </Link>

        <nav className={styles.nav} aria-label="Main">
          <ul role="list">
            {navItems.map((item, i) => (
              <li key={i}>
                <CmsLink link={item} />
              </li>
            ))}
          </ul>
        </nav>

        {phone && (
          <a href={phone.href} className={styles.phone}>
            <Phone aria-hidden />
            <span>{phone.display}</span>
          </a>
        )}

        {cta?.url && <CmsLink link={cta} className={`btn btn--primary ${styles.cta}`} />}

        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X aria-hidden /> : <Menu aria-hidden />}
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>

      <div id={menuId} className={styles.panel} hidden={!open}>
        <nav aria-label="Mobile" className="container">
          <ul role="list">
            {navItems.map((item, i) => (
              <li key={i} onClick={close}>
                <CmsLink link={item} />
              </li>
            ))}
          </ul>
          <div className={styles.panelActions} onClick={close}>
            {cta?.url && <CmsLink link={cta} className="btn btn--primary" />}
            {phone && (
              <a href={phone.href} className="btn btn--outline">
                <Phone aria-hidden /> {phone.display}
              </a>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
