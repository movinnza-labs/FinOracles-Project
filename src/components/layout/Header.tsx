'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useState } from 'react'
import { ChevronDown, Menu, Phone, X } from 'lucide-react'
import { CmsLink, type LinkData } from '@/components/ui/CmsLink'
import { Icon } from '@/components/ui/Icon'
import type { ImageData } from '@/lib/media'
import styles from './Header.module.css'

export type ProductMenuGroup = {
  label: string
  items: { name: string; slug: string; icon?: string | null }[]
}

type HeaderProps = {
  logo: ImageData | null
  siteName: string
  navItems: LinkData[]
  cta?: LinkData | null
  phone?: { display: string; href: string } | null
  productMenu?: ProductMenuGroup[]
}

const PRODUCTS_URL = '/products'

export function Header({ logo, siteName, navItems, cta, phone, productMenu = [] }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu after navigating.
  useEffect(() => setOpen(false), [pathname])

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

  const isActive = (url?: string | null) =>
    !!url && (url === '/' ? pathname === '/' : pathname === url || pathname.startsWith(`${url}/`))

  const hasMenu = (item: LinkData) => item.url === PRODUCTS_URL && productMenu.length > 0

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
              <li key={i} className={hasMenu(item) ? styles.hasMenu : undefined}>
                <CmsLink link={item} className={isActive(item.url) ? styles.active : undefined}>
                  {item.label}
                  {hasMenu(item) && <ChevronDown aria-hidden className={styles.caret} />}
                </CmsLink>
                {hasMenu(item) && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownInner}>
                      {productMenu.map((group) => (
                        <div key={group.label}>
                          <p className={styles.dropdownLabel}>{group.label}</p>
                          <ul role="list">
                            {group.items.map((p) => (
                              <li key={p.slug}>
                                <Link href={`/products/${p.slug}`}>
                                  <Icon icon={p.icon} fallback="chart-pie" />
                                  {p.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <Link href={PRODUCTS_URL} className={styles.dropdownAll}>
                      View all products →
                    </Link>
                  </div>
                )}
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
              <li key={i}>
                <CmsLink link={item} />
                {hasMenu(item) && (
                  <ul role="list" className={styles.subList}>
                    {productMenu.flatMap((g) => g.items).map((p) => (
                      <li key={p.slug}>
                        <Link href={`/products/${p.slug}`}>{p.name}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <div className={styles.panelActions}>
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
