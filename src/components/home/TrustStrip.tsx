import type { SiteSetting } from '@/payload-types'
import styles from './TrustStrip.module.css'

export function TrustStrip({ settings }: { settings: SiteSetting }) {
  const reg = settings.registration
  if (!settings.regulators?.length && !reg?.arn) return null

  return (
    <section className={styles.strip} aria-label="Regulatory Bodies">
      <div className={`container ${styles.inner}`}>
        <div className={styles.regs}>
          <p className={styles.label}>Regulatory Bodies</p>
          <ul role="list">
            {settings.regulators?.map((r) => (
              <li key={r.id ?? r.name}>
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  {r.name}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        {reg?.arn && (
          <dl className={styles.reg}>
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
        )}
      </div>
    </section>
  )
}
