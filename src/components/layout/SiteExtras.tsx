import Link from 'next/link'
import { ArrowRight, BadgeCheck, Lock, Mail, MessageSquareText, Phone } from 'lucide-react'
import type { Footer, SiteSetting } from '@/types/content'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { telHref } from '@/lib/text'
import { HideOnPaths } from './HideOnPaths'
import styles from './SiteExtras.module.css'

const waLink = (number: string, message?: string | null) =>
  `https://wa.me/${number.replace(/\D/g, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`

/** Floating WhatsApp button (desktop/tablet; mobile uses the bottom action bar). */
export function WhatsAppButton({ number, message, siteName }: { number?: string | null; message?: string | null; siteName: string }) {
  if (!number) return null
  return (
    <a href={waLink(number, message)} target="_blank" rel="noopener noreferrer" className={styles.whatsapp}>
      <SocialIcon platform="whatsapp" size={28} />
      <span className="sr-only">Chat with {siteName} on WhatsApp (opens in a new tab)</span>
    </a>
  )
}

/** Thin strip above the header: phone, email, ARN and client login. */
export function TopBar({
  settings,
  loginLabel,
  loginUrl,
  showArn,
}: {
  settings: SiteSetting
  loginLabel?: string | null
  loginUrl?: string | null
  showArn?: boolean | null
}) {
  const phone = settings.phones?.[0]
  const email = settings.emails?.[0]?.email
  const arn = settings.registration?.arn
  return (
    <div className={styles.topBar}>
      <div className={`container ${styles.topBarInner}`}>
        <ul role="list" className={styles.topBarContacts}>
          {phone && (
            <li>
              <a href={telHref(phone.number)}>
                <Phone aria-hidden /> {phone.display}
              </a>
            </li>
          )}
          {email && (
            <li>
              <a href={`mailto:${email}`}>
                <Mail aria-hidden /> {email}
              </a>
            </li>
          )}
          {showArn && arn && (
            <li className={styles.topBarArn}>
              <BadgeCheck aria-hidden /> {settings.registration?.statement || 'AMFI-Registered MFD'} · ARN {arn}
            </li>
          )}
        </ul>
        {loginUrl && (
          <Link href={loginUrl} className={styles.topBarLogin}>
            <Lock aria-hidden /> {loginLabel || 'Client Login'}
          </Link>
        )}
      </div>
    </div>
  )
}

/** Consultation banner shown above the footer on every page except Contact. */
export function CtaBand({ band }: { band: Footer['ctaBand'] }) {
  if (!band?.enabled || !band.heading) return null
  return (
    <HideOnPaths paths={['/contact']}>
      <section className={styles.ctaBand} aria-labelledby="cta-band-title">
        <div className={`container ${styles.ctaInner}`}>
          <div>
            <h2 id="cta-band-title" className={styles.ctaTitle}>
              {band.heading}
            </h2>
            {band.text && <p className={styles.ctaText}>{band.text}</p>}
          </div>
          {band.buttonUrl && (
            <Link href={band.buttonUrl} className={`btn btn--primary ${styles.ctaButton}`}>
              {band.buttonLabel || 'Book a Free Consultation'} <ArrowRight aria-hidden />
            </Link>
          )}
        </div>
      </section>
    </HideOnPaths>
  )
}

/** Fixed Call · WhatsApp · Enquire bar on phones. */
export function MobileActionBar({ settings }: { settings: SiteSetting }) {
  const phone = settings.phones?.[0]
  const wa = settings.whatsapp?.number
  return (
    <nav className={styles.mobileBar} aria-label="Quick contact">
      {phone && (
        <a href={telHref(phone.number)}>
          <Phone aria-hidden />
          Call
        </a>
      )}
      {wa && (
        <a href={waLink(wa, settings.whatsapp?.message)} target="_blank" rel="noopener noreferrer">
          <SocialIcon platform="whatsapp" size={20} />
          WhatsApp
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
      <Link href="/contact" className={styles.mobileBarPrimary}>
        <MessageSquareText aria-hidden />
        Enquire
      </Link>
    </nav>
  )
}
