import { ArrowUpRight, Headset, Phone } from 'lucide-react'
import type { HomePage, SiteSetting } from '@/payload-types'
import { CmsLink } from '@/components/ui/CmsLink'
import { Icon } from '@/components/ui/Icon'
import { SectionHead } from '@/components/ui/SectionHead'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { telHref } from '@/lib/text'
import styles from './Logins.module.css'

const audienceLabel: Record<string, string> = { client: 'Clients', partner: 'Partners', employee: 'FinOracles Team' }
const fallbackIcon: Record<string, 'wallet' | 'briefcase' | 'lock'> = {
  client: 'wallet',
  partner: 'briefcase',
  employee: 'lock',
}

/** One equal card per login, plus a "Need help?" card, in a 3 × 2 grid. */
export function Logins({ data, settings }: { data: HomePage['logins']; settings?: SiteSetting }) {
  if (!data?.enabled || !data.items?.length) return null

  const phone = settings?.phones?.[0]
  const wa = settings?.whatsapp?.number

  return (
    <section id="login" className="section section--tinted" aria-labelledby={data.heading ? 'login-title' : undefined}>
      <div className="container">
        <SectionHead id="login-title" heading={data.heading} lead={data.lead} center />

        <ul role="list" className={styles.grid}>
          {data.items.map((item, i) => {
            const audience = item.audience ?? 'client'
            const isClient = audience === 'client'
            return (
              <li key={item.id ?? i} className={`${styles.card} ${isClient ? styles.client : ''} reveal`}>
                <div className={styles.head}>
                  <span className={styles.icon}>
                    <Icon icon={item.icon} fallback={fallbackIcon[audience] ?? 'lock'} />
                  </span>
                  <span className={styles.audience}>{audienceLabel[audience]}</span>
                </div>
                <h3 className="h4">{item.label}</h3>
                {item.description && <p className={styles.text}>{item.description}</p>}
                <CmsLink
                  link={{ ...item, label: undefined }}
                  className={`btn ${isClient ? 'btn--primary' : 'btn--outline'} ${styles.button}`}
                >
                  <span>Login</span>
                  <ArrowUpRight aria-hidden />
                  <span className="sr-only"> to {item.label}</span>
                </CmsLink>
              </li>
            )
          })}

          {(phone || wa) && (
            <li className={`${styles.card} ${styles.help} reveal`}>
              <div className={styles.head}>
                <span className={styles.icon}>
                  <Headset aria-hidden />
                </span>
                <span className={styles.audience}>Support</span>
              </div>
              <h3 className="h4">Need help logging in?</h3>
              <p className={styles.text}>Our team can help you reset access or find the right portal.</p>
              <div className={styles.helpActions}>
                {phone && (
                  <a href={telHref(phone.number)} className={`btn btn--outline ${styles.button}`}>
                    <span>
                      <Phone aria-hidden /> Call
                    </span>
                  </a>
                )}
                {wa && (
                  <a
                    href={`https://wa.me/${wa.replace(/\D/g, '')}?text=${encodeURIComponent('Hello FinOracles, I need help logging in.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn btn--outline ${styles.button}`}
                  >
                    <span>
                      <SocialIcon platform="whatsapp" size={18} /> WhatsApp
                    </span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
              </div>
            </li>
          )}
        </ul>
      </div>
    </section>
  )
}
