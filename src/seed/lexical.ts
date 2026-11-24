/** Minimal builders for Lexical rich-text JSON, used to seed posts, services and pages. */

type Node = Record<string, unknown>

const text = (value: string, format = 0): Node => ({
  type: 'text',
  text: value,
  format,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

const block = (type: string, children: Node[], extra: Node = {}): Node => ({
  type,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  ...extra,
})

/** An internal link node, as Payload's Lexical LinkFeature stores a "custom URL" link. */
const link = (label: string, url: string): Node =>
  block('link', [text(label)], { version: 3, fields: { linkType: 'custom', url, newTab: false } })

const INLINE_LINK = /\[([^\]\n]+)\]\((\/(?!\/)[^\s)]*)\)/g

/** Text with [phrase](/path) markers turned into link nodes. */
const inline = (value: string): Node[] => {
  const parts = value.split(INLINE_LINK)
  const nodes: Node[] = []
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]) nodes.push(text(parts[i]))
    if (parts[i + 1] && parts[i + 2]) nodes.push(link(parts[i + 1], parts[i + 2]))
  }
  return nodes
}

/** The same text without link markers, e.g. to compare against content seeded before links existed. */
export const plainText = (value: string) => value.replace(INLINE_LINK, '$1')

/**
 * Strings may contain internal links written as [phrase](/path), in paragraphs and list items.
 */
export type RichBlock =
  | string
  | { h2: string }
  | { h3: string }
  | { ul: string[] }
  | { quote: string }

export const richText = (blocks: RichBlock[]) => ({
  root: block(
    'root',
    blocks.map((b) => {
      if (typeof b === 'string') return block('paragraph', inline(b), { textFormat: 0, textStyle: '' })
      if ('h2' in b) return block('heading', [text(b.h2)], { tag: 'h2' })
      if ('h3' in b) return block('heading', [text(b.h3)], { tag: 'h3' })
      if ('quote' in b) return block('quote', [text(b.quote)])
      return block(
        'list',
        b.ul.map((item, i) => block('listitem', inline(item), { value: i + 1 })),
        { listType: 'bullet', start: 1, tag: 'ul' },
      )
    }),
  ),
})
