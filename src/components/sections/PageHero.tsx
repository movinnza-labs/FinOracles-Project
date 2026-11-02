import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { JsonLd } from '@/components/ui/JsonLd'
import { breadcrumbSchema } from '@/lib/schema'
import styles from './PageHero.module.css'

type Crumb = { name: string; path: string }

type PageHeroProps = {
  eyebrow?: string | null
  title: string
  lead?: string | null
  /** Trail after "Home"; the last item is the current page. */
  breadcrumbs: Crumb[]
  children?: ReactNode
}

/** Navy title band used at the top of every inner page. Includes breadcrumb JSON-LD. */
export function PageHero({ eyebrow, title, lead, breadcrumbs, children }: PageHeroProps) {
  const trail = [{ name: 'Home', path: '/' }, ...breadcrumbs]
  return (
    <section className={styles.hero}>
      <JsonLd data={breadcrumbSchema(trail)} />
      <div className="container">
        <nav aria-label="Breadcrumb">
          <ol className={styles.crumbs}>
            {trail.map((crumb, i) => {
              const last = i === trail.length - 1
              return (
                <li key={crumb.path}>
                  {last ? (
                    <span aria-current="page">{crumb.name}</span>
                  ) : (
                    <>
                      <Link href={crumb.path}>{crumb.name}</Link>
                      <ChevronRight aria-hidden />
                    </>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {lead && <p className={styles.lead}>{lead}</p>}
        {children}
      </div>
    </section>
  )
}
