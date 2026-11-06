import type { Field, GroupField } from 'payload'

/**
 * A CMS-managed link. `url` accepts in-page anchors (/#contact), site paths (/blog),
 * tel:/mailto: links and absolute URLs.
 */
export const linkFields: Field[] = [
  {
    type: 'row',
    fields: [
      { name: 'label', type: 'text', required: true, admin: { width: '40%' } },
      {
        name: 'url',
        type: 'text',
        required: true,
        admin: { width: '45%', description: 'e.g. /#contact, /blog, https://…' },
      },
      {
        name: 'newTab',
        type: 'checkbox',
        label: 'New tab',
        defaultValue: false,
        admin: { width: '15%', style: { alignSelf: 'flex-end' } },
      },
    ],
  },
]

export const linkGroup = (name = 'link', overrides: Partial<GroupField> = {}): GroupField =>
  ({
    name,
    type: 'group',
    fields: linkFields,
    ...overrides,
  }) as GroupField

export const ctaFields: Field[] = [
  ...linkFields,
  {
    name: 'style',
    type: 'select',
    defaultValue: 'primary',
    options: [
      { label: 'Primary (red)', value: 'primary' },
      { label: 'Outline', value: 'outline' },
      { label: 'Outline on dark', value: 'onDark' },
    ],
  },
]
