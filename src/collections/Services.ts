import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { iconField } from '../fields/icon'
import { seoTab } from '../fields/seo'
import { slugField } from '../fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'
import { previewPath } from '../lib/url'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'showOnHome'],
    group: 'Content',
    preview: (doc) => previewPath(`/services/${doc?.slug ?? ''}`),
  },
  defaultSort: 'order',
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollectionDelete] },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            iconField(),
            {
              name: 'summary',
              type: 'textarea',
              required: true,
              admin: { description: 'Shown on the service card.' },
            },
            {
              name: 'features',
              type: 'array',
              label: 'Key features',
              maxRows: 5,
              admin: { description: '3 short points shown as a checklist on the service card.' },
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            { name: 'image', type: 'upload', relationTo: 'media' },
            {
              name: 'content',
              type: 'richText',
              admin: { description: 'Full description for the service detail page.' },
            },
          ],
        },
        seoTab,
      ],
    },
    slugField('title'),
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    {
      name: 'showOnHome',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show on homepage',
      admin: { position: 'sidebar' },
    },
  ],
}
