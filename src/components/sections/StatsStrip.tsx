import { Icon } from '@/components/ui/Icon'
import { CountUp } from './CountUp'
import styles from './StatsStrip.module.css'

type Stat = { id?: string | null; icon?: string | null; value: number; suffix?: string | null; label: string }

export function StatsStrip({ items, label = 'FinOracles in numbers' }: { items?: Stat[] | null; label?: string }) {
  if (!items?.length) return null
  return (
    <section className={`${styles.stats} section--navy`} aria-label={label}>
      <ul role="list" className={`container ${styles.list}`}>
        {items.map((item) => (
          <li key={item.id ?? item.label} className="reveal">
            <Icon icon={item.icon} fallback="award" />
            <p className={styles.value}>
              <CountUp value={item.value} />
              {item.suffix}
            </p>
            <p className={styles.label}>{item.label}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
