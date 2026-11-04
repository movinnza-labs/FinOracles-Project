import type { FieldHook, TextField } from 'payload'

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

const formatSlug =
  (fallbackField: string): FieldHook =>
  ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.length > 0) return slugify(value)
    const source = data?.[fallbackField] ?? originalDoc?.[fallbackField]
    return typeof source === 'string' ? slugify(source) : value
  }

/** URL slug, auto-generated from `fallbackField` when left empty. */
export const slugField = (fallbackField = 'title'): TextField => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: `Used in the page URL. Leave empty to generate from the ${fallbackField}.`,
  },
  hooks: { beforeValidate: [formatSlug(fallbackField)] },
  // A title written only in Devanagari slugifies to '' (empty URL, duplicate-key errors).
  validate: (value: string | null | undefined) =>
    value ? true : 'Please enter a URL slug using English letters or numbers (e.g. my-page).',
})
