import type { HomePage } from '@/payload-types'
import { Icon } from '@/components/ui/Icon'
import { noBreakHyphens } from '@/lib/text'
import styles from './Guidance.module.css'

export function Guidance({ data }: { data: HomePage['guidance'] }) {
  if (!data?.enabled) return null
  return (
    <section className="section" aria-labelledby="guidance">
      <div className="container two-col">
        <div className="reveal">
          <h2 id="guidance" className="h2">
            {data.heading} {data.subheading && <span className="subheading">{data.subheading}</span>}
          </h2>
          {data.quote && <p className="quote">{noBreakHyphens(data.quote)}</p>}
          {data.lead && <p className="lead">{noBreakHyphens(data.lead)}</p>}
        </div>
        {!!data.steps?.length && (
          <ol className={styles.process}>
            {data.steps.map((step) => (
              <li key={step.id ?? step.title} className="reveal">
                <span className={styles.num}>
                  <Icon icon={step.icon} />
                </span>
                <div>
                  <h3 className="h4">{step.title}</h3>
                  {step.text && <p>{step.text}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
