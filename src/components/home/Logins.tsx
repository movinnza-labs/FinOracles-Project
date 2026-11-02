import { ArrowUpRight, Briefcase, CircleCheck, Headset, Phone, ShieldCheck, UserRound } from 'lucide-react'
import type { HomePage, SiteSetting } from '@/payload-types'
import { CmsLink } from '@/components/ui/CmsLink'
import { SectionHead } from '@/components/ui/SectionHead'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { telHref } from '@/lib/text'
import styles from './Logins.module.css'

type LoginItem = NonNullable<NonNullable<HomePage['logins']>['items']>[number]

const audienceLabel: Record<string, string> = { client: 'Client', partner: 'Partner', employee: 'Employee' }
const audienceIcon = { client: UserRound, partner: Briefcase, employee: ShieldCheck } as const

/**
 * Login hub: the client login is featured (most visitors are clients), partner and
 * employee logins are listed beside it, with a help line for login trouble.
 */
export function Logins({ data, settings }: { data: HomePage['logins']; settings?: SiteSetting }) {
  if (!data?.enabled || !data.items?.length) return null

  const featured = data.items.find((i) => (i.audience ?? 'client') === 'client') ?? data.items[0]
  const others = data.items.filter((i) => i !== featured)
  const phone = settings?.phones?.[0]
  const wa = settings?.whatsapp?.number

  return (
    <section id="login" className="section section--tinted" aria-labelledby={data.heading ? 'login-title' : undefined}>
      <div className="container">
        <SectionHead id="login-title" heading={data.heading} lead={data.lead} center />

        <div className={styles.grid}>
          <FeaturedLogin item={featured} />

          <div className={`${styles.side} reveal`}>
            {others.length > 0 && (
              <div className={styles.listCard}>
                <p className={styles.listTitle}>Partner &amp; employee logins</p>
                <ul role="list" className={styles.list}>
                  {others.map((item, i) => {
                    const Icon = audienceIcon[(item.audience ?? 'partner') as keyof typeof audienceIcon] ?? Briefcase
                    return (
                      <li key={item.id ?? i}>
                        <CmsLink link={{ ...item, label: undefined }} className={styles.row}>
                          <span className={styles.rowIcon}>
                            <Icon aria-hidden />
                          </span>
                          <span className={styles.rowText}>
                            <span className={styles.rowLabel}>
                              {item.label}
                              {item.audience && <span className={styles.badge}>{audienceLabel[item.audience]}</span>}
                            </span>
                            {item.description && <span className={styles.rowDesc}>{item.description}</span>}
                          </span>
                          <ArrowUpRight aria-hidden className={styles.rowArrow} />
                        </CmsLink>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {(phone || wa) && (
              <div className={styles.help}>
                <Headset aria-hidden className={styles.helpIcon} />
                <div className={styles.helpText}>
                  <p className={styles.helpTitle}>Trouble logging in?</p>
                  <p>Our team can help you reset access or find the right portal.</p>
                </div>
                <div className={styles.helpActions}>
                  {phone && (
                    <a href={telHref(phone.number)} className="btn btn--outline">
                      <Phone aria-hidden /> Call
                    </a>
                  )}
                  {wa && (
                    <a
                      href={`https://wa.me/${wa.replace(/\D/g, '')}?text=${encodeURIComponent('Hello FinOracles, I need help logging in.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--outline"
                    >
                      <SocialIcon platform="whatsapp" size={18} /> WhatsApp
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturedLogin({ item }: { item: LoginItem }) {
  return (
    <div className={`${styles.featured} reveal`}>
      <span className={styles.featuredIcon}>
        <UserRound aria-hidden />
      </span>
      <p className={styles.featuredEyebrow}>For our clients</p>
      <h3 className={styles.featuredTitle}>{item.label}</h3>
      {item.description && <p className={styles.featuredDesc}>{item.description}</p>}
      {!!item.features?.length && (
        <ul role="list" className={styles.features}>
          {item.features.map((f) => (
            <li key={f.id ?? f.text}>
              <CircleCheck aria-hidden />
              {f.text}
            </li>
          ))}
        </ul>
      )}
      <CmsLink link={{ ...item, label: `Go to ${item.label}` }} className={`btn btn--primary ${styles.featuredBtn}`} arrow />
      <p className={styles.secure}>
        <ShieldCheck aria-hidden /> You will be taken to the secure partner platform to sign in.
      </p>
    </div>
  )
}
