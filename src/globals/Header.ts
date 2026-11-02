import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { linkFields } from '../fields/link'
import { revalidateGlobal } from '../hooks/revalidate'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header & Navigation',
  admin: { group: 'Globals' },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      label: 'Navigation menu',
      maxRows: 10,
      fields: linkFields,
      admin: { initCollapsed: true },
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Header button',
      fields: linkFields,
    },
    {
      name: 'showPhone',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show primary phone number in the header',
    },
  ],
}
