import { ArrowUpRight, Briefcase, CircleCheck, ShieldCheck, UserRound, type LucideIcon } from 'lucide-react'
import type { HomePage, SiteSetting } from '@/payload-types'
import { CmsLink } from '@/components/ui/CmsLink'
import { SectionHead } from '@/components/ui/SectionHead'
import { telHref } from '@/lib/text'
import styles from './Logins.module.css'

type LoginItem = NonNullable<NonNullable<HomePage['logins']>['items']>[number]

const groups: { audience: string; title: string; text: string; Icon: LucideIcon }[] = [
  {
    audience: 'client',
    title: 'Clients',
    text: 'Access your E-Wealth Account to track and manage your investments.',
    Icon: UserRound,
  },
  {
    audience: 'partner',
    title: 'Partners',
    text: 'Sign in to the partner platforms we work with.',
    Icon: Briefcase,
  },
  {
    audience: 'employee',
    title: 'FinOracles Team',
    text: 'Staff access to manage the website and enquiries.',
    Icon: ShieldCheck,
  },
]

/** Three equal cards (Clients · Partners · Team), each listing its login links. */
export function Logins({ data, settings }: { data: HomePage['logins']; settings?: SiteSetting }) {
  if (!data?.enabled || !data.items?.length) return null

  const items = data.items
  const byAudience = (a: string) => items.filter((i) => (i.audience ?? 'client') === a)
  const visibleGroups = groups.filter((g) => byAudience(g.audience).length > 0)
  const phone = settings?.phones?.[0]
  const wa = settings?.whatsapp?.number

  return (
    <section id="login" className="section section--tinted" aria-labelledby={data.heading ? 'login-title' : undefined}>
      <div className="container">
        <SectionHead id="login-title" heading={data.heading} lead={data.lead} center />

        <ul role="list" className={styles.grid} data-count={visibleGroups.length}>
          {visibleGroups.map(({ audience, title, text, Icon }) => {
            const links = byAudience(audience)
            const primary = audience === 'client'
            // A group's own description comes from its first login's description if set in the CMS.
            const description = links.length === 1 && links[0].description ? links[0].description : text
            const features = primary ? (links[0]?.features ?? []) : []
            return (
              <li key={audience} className={`${styles.card} reveal`}>
                <span className={styles.icon}>
                  <Icon aria-hidden />
                </span>
                <h3 className="h4">{title}</h3>
                <p className={styles.text}>{description}</p>

                {features.length > 0 && (
                  <ul role="list" className={styles.features}>
                    {features.map((f) => (
                      <li key={f.id ?? f.text}>
                        <CircleCheck aria-hidden />
                        {f.text}
                      </li>
                    ))}
                  </ul>
                )}

                <div className={styles.links}>
                  {links.map((item: LoginItem, i) => (
                    <CmsLink
                      key={item.id ?? i}
                      link={{ ...item, label: undefined }}
                      className={`btn ${primary ? 'btn--primary' : 'btn--outline'} ${styles.linkBtn}`}
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight aria-hidden />
                    </CmsLink>
                  ))}
                </div>
              </li>
            )
          })}
        </ul>

        {(phone || wa) && (
          <p className={styles.help}>
            Trouble logging in?{' '}
            {phone && (
              <>
                Call <a href={telHref(phone.number)}>{phone.display}</a>
              </>
            )}
            {phone && wa && ' or '}
            {wa && (
              <a
                href={`https://wa.me/${wa.replace(/\D/g, '')}?text=${encodeURIComponent('Hello FinOracles, I need help logging in.')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp us
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            .
          </p>
        )}
      </div>
    </section>
  )
}
