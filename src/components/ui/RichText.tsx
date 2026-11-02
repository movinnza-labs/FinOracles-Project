import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import styles from './RichText.module.css'

type RichTextProps = {
  data?: unknown
  className?: string
}

/** Renders Lexical rich text from the CMS with the site's typographic styles. */
export function RichText({ data, className }: RichTextProps) {
  if (!data || typeof data !== 'object') return null
  return (
    <LexicalRichText
      data={data as SerializedEditorState}
      className={[styles.prose, className].filter(Boolean).join(' ')}
    />
  )
}
