import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { iconField } from '../fields/icon'
import { slugField } from '../fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Product', plural: 'Products' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'order'],
    group: 'Content',
    description: 'Financial products listed in the "Our Products" explorer on the homepage.',
  },
  defaultSort: 'order',
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollectionDelete] },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'select',
          required: true,
          defaultValue: 'invest',
          options: [
            { label: 'Invest', value: 'invest' },
            { label: 'Protect', value: 'protect' },
            { label: 'Borrow', value: 'borrow' },
          ],
        },
        iconField(),
      ],
    },
    {
      name: 'tagline',
      type: 'text',
      admin: { description: 'Short closing line, e.g. "Smart diversification. Strategic growth."' },
    },
    { name: 'description', type: 'textarea', required: true },
    {
      name: 'highlights',
      type: 'array',
      label: 'Key highlights',
      maxRows: 6,
      admin: { description: '3–4 short, factual points shown as a checklist.' },
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    {
      name: 'idealFor',
      type: 'text',
      label: 'Ideal for',
      admin: { description: 'Who this product suits, e.g. "Long-term investors building wealth for goals".' },
    },
    {
      name: 'enquiryLabel',
      type: 'text',
      admin: { description: 'Short name used on the enquiry button, e.g. "Mutual Funds". Defaults to the product name.' },
    },
    slugField('name'),
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
