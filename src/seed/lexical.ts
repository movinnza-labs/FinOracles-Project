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
      if (typeof b === 'string') return block('paragraph', [text(b)], { textFormat: 0, textStyle: '' })
      if ('h2' in b) return block('heading', [text(b.h2)], { tag: 'h2' })
      if ('h3' in b) return block('heading', [text(b.h3)], { tag: 'h3' })
      if ('quote' in b) return block('quote', [text(b.quote)])
      return block(
        'list',
        b.ul.map((item, i) => block('listitem', [text(item)], { value: i + 1 })),
        { listType: 'bullet', start: 1, tag: 'ul' },
      )
    }),
  ),
})
