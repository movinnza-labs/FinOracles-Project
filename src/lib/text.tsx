import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'

/** Keeps hyphenated words (e.g. "long-term") from breaking across lines, as in the design. */
export const noBreakHyphens = (value: string): ReactNode => {
  const parts = value.split(/(\b[\w']+(?:-[\w']+)+\b)/g)
  if (parts.length === 1) return value
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="nowrap">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

/**
 * Inline links in CMS textareas: [phrase](/path) or [phrase](https://…). Only site paths and
 * http(s) URLs are accepted, so a typo or a pasted javascript: link stays plain text.
 */
const INLINE_LINK = /\[([^\]\n]+)\]\((\/(?!\/)[^\s)]*|https?:\/\/[^\s)]+)\)/g

/** Text with [phrase](/url) links rendered as links; the rest keeps noBreakHyphens. */
export const withLinks = (value: string): ReactNode => {
  const parts = value.split(INLINE_LINK)
  if (parts.length === 1) return noBreakHyphens(value)
  const out: ReactNode[] = []
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]) out.push(<Fragment key={i}>{noBreakHyphens(parts[i])}</Fragment>)
    const label = parts[i + 1]
    const href = parts[i + 2]
    if (label && href) {
      out.push(
        href.startsWith('/') ? (
          <Link key={`l${i}`} href={href}>
            {label}
          </Link>
        ) : (
          <a key={`l${i}`} href={href} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        ),
      )
    }
  }
  return out
}

/** The same text with [phrase](/url) reduced to "phrase", for meta tags and other plain-text uses. */
export const stripLinks = (value?: string | null): string => (value ?? '').replace(INLINE_LINK, '$1')

/** Splits CMS textarea content on blank lines. */
export const toParagraphs = (value?: string | null): string[] =>
  (value ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

type ParagraphsProps = { text?: string | null; className?: string }

export function Paragraphs({ text, className }: ParagraphsProps) {
  return toParagraphs(text).map((p, i) => (
    <p key={i} className={className}>
      {withLinks(p)}
    </p>
  ))
}

export const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(value))
    : ''

export const telHref = (number?: string | null) => `tel:${(number ?? '').replace(/[^\d+]/g, '')}`
