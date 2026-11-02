import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { linkFields } from '../fields/link'
import { revalidateGlobal } from '../hooks/revalidate'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  admin: { group: 'Globals' },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { name: 'aboutTitle', type: 'text', defaultValue: 'About FinOracles' },
    { name: 'aboutText', type: 'textarea' },
    {
      name: 'columns',
      type: 'array',
      label: 'Link columns',
      maxRows: 3,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'links', type: 'array', fields: linkFields },
      ],
    },
    {
      name: 'showRegulators',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show regulatory bodies column',
    },
    {
      name: 'copyright',
      type: 'text',
      defaultValue: '© {year} FinOracles Services Pvt. Ltd. All Rights Reserved.',
      admin: { description: '{year} is replaced with the current year.' },
    },
    {
      name: 'credit',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'prefix', type: 'text', defaultValue: 'Designed & developed by' },
            { name: 'label', type: 'text', defaultValue: 'Movinnza' },
            { name: 'url', type: 'text', defaultValue: 'https://movinnza.in/' },
          ],
        },
      ],
    },
  ],
}
