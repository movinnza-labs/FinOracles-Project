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
      {noBreakHyphens(p)}
    </p>
  ))
}

export const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
    : ''

export const telHref = (number?: string | null) => `tel:${(number ?? '').replace(/[^\d+]/g, '')}`
