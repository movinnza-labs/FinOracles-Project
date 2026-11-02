import { Paragraphs } from '@/lib/text'

type SectionHeadProps = {
  id?: string
  eyebrow?: string | null
  heading?: string | null
  lead?: string | null
  center?: boolean
  /** Use h1 for the main heading on inner pages. */
  as?: 'h1' | 'h2'
}

export function SectionHead({ id, eyebrow, heading, lead, center, as: Tag = 'h2' }: SectionHeadProps) {
  if (!heading && !lead) return null
  return (
    <div className={['section-head', 'reveal', center && 'section-head--center'].filter(Boolean).join(' ')}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {heading && (
        <Tag id={id} className="h2">
          {heading}
        </Tag>
      )}
      {lead && (
        <div className="lead">
          <Paragraphs text={lead} />
        </div>
      )}
    </div>
  )
}
