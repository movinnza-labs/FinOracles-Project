import { ArrowUpRight, Lock } from 'lucide-react'
import type { HomePage } from '@/payload-types'
import { CmsLink } from '@/components/ui/CmsLink'
import { SectionHead } from '@/components/ui/SectionHead'
import styles from './Logins.module.css'

export function Logins({ data }: { data: HomePage['logins'] }) {
  if (!data?.enabled || !data.items?.length) return null
  return (
    <section id="login" className="section section--tinted" aria-labelledby="login-title">
      <div className="container">
        <SectionHead id="login-title" heading={data.heading} lead={data.lead} center />
        <ul role="list" className={styles.logins}>
          {data.items.map((item) => (
            <li key={item.id ?? item.label} className="reveal">
              <CmsLink link={{ ...item, label: undefined }} className={styles.tile}>
                <Lock aria-hidden className={styles.lock} />
                <span>{item.label}</span>
                <ArrowUpRight aria-hidden className={styles.arrow} />
              </CmsLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
