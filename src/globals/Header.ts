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
      admin: {
        initCollapsed: true,
        description: 'The item linking to /products automatically shows a drop-down of all products.',
      },
      fields: linkFields,
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
      defaultValue: false,
      label: 'Also show the phone number in the main bar (it is always in the top bar)',
    },
    {
      name: 'topBar',
      type: 'group',
      label: 'Top bar',
      admin: { description: 'Thin strip above the header (desktop and tablet).' },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        { name: 'showArn', type: 'checkbox', defaultValue: true, label: 'Show ARN' },
        { name: 'loginLabel', type: 'text', defaultValue: 'Client Login' },
        { name: 'loginUrl', type: 'text', defaultValue: '/login' },
      ],
    },
  ],
}
