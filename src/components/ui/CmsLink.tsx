import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

export type LinkData = {
  label?: string | null
  url?: string | null
  newTab?: boolean | null
  style?: 'primary' | 'outline' | 'onDark' | null
}

type CmsLinkProps = {
  link: LinkData
  className?: string
  children?: ReactNode
  /** Append a trailing arrow (internal) or arrow-up-right (new tab). */
  arrow?: boolean
}

const isInternal = (url: string) => url.startsWith('/') && !url.startsWith('//')

/**
 * Renders a CMS link: next/link for site paths, a plain anchor for in-page
 * anchors, tel:, mailto: and external URLs. New-tab links get rel + SR text.
 */
export function CmsLink({ link, className, children, arrow = false }: CmsLinkProps) {
  const url = link.url || '#'
  const content = children ?? link.label
  const newTab = !!link.newTab
  const ArrowIcon = newTab ? ArrowUpRight : ArrowRight

  const inner = (
    <>
      {content}
      {arrow && <ArrowIcon aria-hidden focusable={false} />}
      {newTab && <span className="sr-only"> (opens in a new tab)</span>}
    </>
  )

  if (isInternal(url) && !newTab) {
    return (
      <Link href={url} className={className}>
        {inner}
      </Link>
    )
  }

  return (
    <a
      href={url}
      className={className}
      {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {inner}
    </a>
  )
}

/** CMS link styled as a button. */
export function ButtonLink({
  link,
  variant,
  arrow,
  className,
}: {
  link: LinkData
  variant?: LinkData['style']
  arrow?: boolean
  className?: string
}) {
  const style = variant ?? link.style ?? 'primary'
  return (
    <CmsLink
      link={link}
      arrow={arrow ?? style === 'primary'}
      className={['btn', `btn--${style}`, className].filter(Boolean).join(' ')}
    />
  )
}
