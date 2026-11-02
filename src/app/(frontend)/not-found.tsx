import Link from 'next/link'
import styles from './not-found.module.css'

export const metadata = { title: 'Page not found', robots: { index: false } }

export default function NotFound() {
  return (
    <section className={`section ${styles.page}`}>
      <div className="container container--narrow">
        <p className="eyebrow">Error 404</p>
        <h1 className="h2">We couldn’t find that page.</h1>
        <p className="lead">The page may have moved or no longer exists. Let’s get you back on track.</p>
        <div className={styles.actions}>
          <Link href="/" className="btn btn--primary">
            Back to home
          </Link>
          <Link href="/#contact" className="btn btn--outline">
            Contact us
          </Link>
        </div>
      </div>
    </section>
  )
}
