import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { iconField } from '../fields/icon'
import { seoTab } from '../fields/seo'
import { slugField } from '../fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'
import { previewPath } from '../lib/url'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Product', plural: 'Products' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'order'],
    group: 'Content',
    description: 'Each product has its own landing page at /products/[slug] and appears in the homepage explorer.',
    preview: (doc) => previewPath(`/products/${doc?.slug ?? ''}`),
  },
  defaultSort: 'order',
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollectionDelete] },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
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
              admin: {
                description: 'Short name used on enquiry buttons and the form, e.g. "Mutual Funds". Defaults to the name.',
              },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Optional image for the product page.' },
            },
            {
              name: 'faqs',
              type: 'array',
              label: 'FAQs',
              admin: { description: 'Shown on the product page and marked up for Google (FAQ rich results).' },
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'textarea', required: true },
              ],
            },
          ],
        },
        seoTab,
      ],
    },
    slugField('name'),
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
