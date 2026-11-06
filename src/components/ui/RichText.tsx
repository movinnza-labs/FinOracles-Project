import { Fragment, type ReactNode } from 'react'
import styles from './RichText.module.css'

type RichTextProps = {
  data?: unknown
  className?: string
}

type LexicalNode = {
  type?: string
  text?: string
  format?: number | string
  tag?: string
  listType?: string
  url?: string
  fields?: { url?: string; newTab?: boolean }
  children?: LexicalNode[]
}

// Lexical text format bit flags.
const BOLD = 1
const ITALIC = 2
const STRIKE = 4
const UNDERLINE = 8
const CODE = 16

const renderText = (node: LexicalNode): ReactNode => {
  let out: ReactNode = node.text ?? ''
  const f = typeof node.format === 'number' ? node.format : 0
  if (f & CODE) out = <code>{out}</code>
  if (f & STRIKE) out = <s>{out}</s>
  if (f & UNDERLINE) out = <u>{out}</u>
  if (f & ITALIC) out = <em>{out}</em>
  if (f & BOLD) out = <strong>{out}</strong>
  return out
}

const renderChildren = (nodes?: LexicalNode[]): ReactNode =>
  nodes?.map((n, i) => <Fragment key={i}>{renderNode(n)}</Fragment>)

const renderNode = (node: LexicalNode): ReactNode => {
  switch (node.type) {
    case 'text':
      return renderText(node)
    case 'linebreak':
      return <br />
    case 'paragraph':
      return <p>{renderChildren(node.children)}</p>
    case 'heading': {
      const Tag = (['h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag ?? '') ? node.tag : 'h2') as 'h2'
      return <Tag>{renderChildren(node.children)}</Tag>
    }
    case 'quote':
      return <blockquote>{renderChildren(node.children)}</blockquote>
    case 'list':
      return node.listType === 'number' ? (
        <ol>{renderChildren(node.children)}</ol>
      ) : (
        <ul>{renderChildren(node.children)}</ul>
      )
    case 'listitem':
      return <li>{renderChildren(node.children)}</li>
    case 'link':
    case 'autolink': {
      const href = node.fields?.url ?? node.url ?? '#'
      const external = node.fields?.newTab
      return (
        <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {renderChildren(node.children)}
        </a>
      )
    }
    default:
      return renderChildren(node.children)
  }
}

/** Renders Lexical rich-text JSON (src/content/lexical.ts) with the site's typographic styles. */
export function RichText({ data, className }: RichTextProps) {
  const root = (data as { root?: LexicalNode } | null)?.root
  if (!root) return null
  return <div className={[styles.prose, className].filter(Boolean).join(' ')}>{renderChildren(root.children)}</div>
}
