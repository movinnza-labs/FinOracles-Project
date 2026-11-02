import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, Mail, Phone } from 'lucide-react'
import type { Footer as FooterData, SiteSetting } from '@/payload-types'
import { CmsLink } from '@/components/ui/CmsLink'
import { getImage } from '@/lib/media'
import { telHref } from '@/lib/text'
import styles from './Footer.module.css'

type FooterProps = { footer: FooterData; settings: SiteSetting }

export function Footer({ footer, settings }: FooterProps) {
  const logo = getImage(settings.logo)
  const phone = settings.phones?.[0]
  const email = settings.emails?.[0]?.email
  const reg = settings.registration
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo} aria-label={`${settings.siteName} home`}>
            {logo ? (
              <Image src={logo.src} alt={logo.alt || settings.siteName} width={logo.width} height={logo.height} />
            ) : (
              settings.siteName
            )}
          </Link>
          {footer.aboutTitle && <h2 className={styles.title}>{footer.aboutTitle}</h2>}
          {footer.aboutText && <p>{footer.aboutText}</p>}
          <address className={styles.contact}>
            {phone && (
              <a href={telHref(phone.number)}>
                <Phone aria-hidden /> {phone.display}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`}>
                <Mail aria-hidden /> {email}
              </a>
            )}
          </address>
        </div>

        {footer.columns?.map((column) => (
          <nav key={column.id ?? column.title} aria-label={column.title}>
            <h2 className={styles.title}>{column.title}</h2>
            <ul role="list" className={styles.links}>
              {column.links?.map((link, i) => (
                <li key={link.id ?? i}>
                  <CmsLink link={link} />
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {footer.showRegulators && !!settings.regulators?.length && (
          <div>
            <h2 className={styles.title}>Regulatory Bodies</h2>
            <ul role="list" className={styles.regulators}>
              {settings.regulators.map((r) => (
                <li key={r.id ?? r.name}>
                  <CmsLink link={{ label: r.name, url: r.url, newTab: true }} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {reg?.arn && (
        <div className="container">
          <div className={styles.registration}>
            <BadgeCheck aria-hidden />
            <p>
              {reg.registeredName && <strong>“{reg.registeredName}”</strong>} {reg.statement}
            </p>
            <dl>
              <div>
                <dt>ARN</dt>
                <dd>{reg.arn}</dd>
              </div>
              {reg.initialRegistration && (
                <div>
                  <dt>Date of Initial Registration</dt>
                  <dd>{reg.initialRegistration}</dd>
                </div>
              )}
              {reg.validity && (
                <div>
                  <dt>Current Validity</dt>
                  <dd>{reg.validity}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      <div className={`container ${styles.legal}`}>
        <p>{(footer.copyright || '© {year}').replace('{year}', String(year))}</p>
        {footer.credit?.label && footer.credit.url && (
          <p>
            {footer.credit.prefix}{' '}
            <a href={footer.credit.url} target="_blank" rel="noopener">
              {footer.credit.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        )}
      </div>
    </footer>
  )
}
