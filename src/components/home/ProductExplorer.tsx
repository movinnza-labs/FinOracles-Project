'use client'

import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowRight, CircleCheck, Info, Users } from 'lucide-react'
import { Icon, IconTile } from '@/components/ui/Icon'
import { SocialIcon } from '@/components/ui/SocialIcon'
import styles from './ProductExplorer.module.css'

export type ProductItem = {
  id: number | string
  name: string
  category: string
  icon?: string | null
  tagline?: string | null
  description: string
  highlights: string[]
  idealFor?: string | null
  enquiryLabel?: string | null
}

const categories = [
  { value: 'invest', label: 'Invest' },
  { value: 'protect', label: 'Protect' },
  { value: 'borrow', label: 'Borrow' },
] as const

/** Statutory notes shown under each product, by category. */
const compliance: Record<string, string> = {
  invest: 'Mutual Fund investments are subject to market risks, read all scheme related documents carefully.',
  protect: 'Insurance is the subject matter of solicitation. Please read the policy wording carefully before buying.',
  borrow: 'Loans are subject to the lender’s eligibility criteria, terms and conditions.',
}

type ProductExplorerProps = {
  products: ProductItem[]
  label: string
  contactAnchor?: string | null
  whatsappNumber?: string | null
}

/** Grouped product tabs with a detail panel (keyboard accessible per WAI-ARIA tabs). */
export function ProductExplorer({ products, label, contactAnchor = '#contact', whatsappNumber }: ProductExplorerProps) {
  // Order tabs by category group, keeping CMS order within each group.
  const groups = useMemo(
    () =>
      categories
        .map((c) => ({ ...c, items: products.filter((p) => p.category === c.value) }))
        .filter((g) => g.items.length > 0),
    [products],
  )
  const ordered = useMemo(() => groups.flatMap((g) => g.items), [groups])

  const [active, setActive] = useState(0)
  const baseId = useId()
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
  const product = ordered[active]

  const onKeyDown = (e: KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowDown: active + 1,
      ArrowRight: active + 1,
      ArrowUp: active - 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: ordered.length - 1,
    }
    if (!(e.key in keys)) return
    e.preventDefault()
    const next = (keys[e.key] + ordered.length) % ordered.length
    setActive(next)
    tabsRef.current[next]?.focus()
  }

  if (!product) return null

  const shortName = product.enquiryLabel || product.name
  const categoryLabel = categories.find((c) => c.value === product.category)?.label ?? product.category
  const waHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hello FinOracles, I would like to know more about ${shortName}.`,
      )}`
    : null

  // Pre-fill the contact form so the enquiry arrives tagged with the product.
  const prefillEnquiry = () => {
    const subject = document.getElementById('enquiry-subject') as HTMLInputElement | null
    if (subject) subject.value = `Enquiry: ${shortName}`
    window.setTimeout(() => document.getElementById('enquiry-name')?.focus({ preventScroll: true }), 400)
  }

  let index = -1

  return (
    <div className={styles.explorer}>
      <div role="tablist" aria-label={label} aria-orientation="vertical" className={styles.list} onKeyDown={onKeyDown}>
        {groups.map((group) => (
          <div key={group.value} role="presentation" className={styles.group}>
            <p className={styles.groupLabel} aria-hidden>
              {group.label}
            </p>
            {group.items.map((p) => {
              index += 1
              const i = index
              return (
                <button
                  key={p.id}
                  ref={(el) => {
                    tabsRef.current[i] = el
                  }}
                  id={`${baseId}-tab-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={i === active ? 0 : -1}
                  className={styles.tab}
                  onClick={() => setActive(i)}
                >
                  <Icon icon={p.icon} fallback="chart-pie" />
                  <span>{p.name}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${active}`} className={styles.panel}>
        <div key={product.id} className={styles.content}>
          <div className={styles.head}>
            <IconTile name={product.icon} fallback="chart-pie" />
            <span className="tag">{categoryLabel}</span>
          </div>

          <h3 className="h3">{product.name}</h3>
          {product.tagline && <p className={styles.tagline}>{product.tagline}</p>}
          <p className={styles.description}>{product.description}</p>

          {product.highlights.length > 0 && (
            <div className={styles.highlights}>
              <h4 className={styles.subhead}>Key highlights</h4>
              <ul role="list">
                {product.highlights.map((h) => (
                  <li key={h}>
                    <CircleCheck aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.idealFor && (
            <p className={styles.ideal}>
              <Users aria-hidden />
              <span>
                <strong>Ideal for:</strong> {product.idealFor}
              </span>
            </p>
          )}

          <div className={styles.actions}>
            <a href={contactAnchor || '#contact'} className="btn btn--primary" onClick={prefillEnquiry}>
              Enquire about {shortName}
              <ArrowRight aria-hidden />
            </a>
            {waHref && (
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
                <SocialIcon platform="whatsapp" size={18} />
                Ask on WhatsApp
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>

          {compliance[product.category] && (
            <p className={styles.note}>
              <Info aria-hidden />
              {compliance[product.category]}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
