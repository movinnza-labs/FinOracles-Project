import type { CollectionConfig } from 'payload'
import { authenticated, authenticatedOrPublished } from '../access'
import { seoTab } from '../fields/seo'
import { slugField } from '../fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'
import { previewPath } from '../lib/url'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', '_status'],
    group: 'Blog',
    preview: (doc) => previewPath(`/blog/${doc?.slug ?? ''}`),
  },
  access: {
    read: authenticatedOrPublished,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 25 },
  hooks: {
    afterChange: [revalidateCollection],
    afterDelete: [revalidateCollectionDelete],
    beforeChange: [
      ({ data }) => {
        if (data._status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'excerpt',
              type: 'textarea',
              maxLength: 300,
              admin: { description: 'Short summary shown on blog cards (max 300 characters).' },
            },
            { name: 'coverImage', type: 'upload', relationTo: 'media' },
            { name: 'content', type: 'richText', required: true },
          ],
        },
        seoTab,
      ],
    },
    slugField('title'),
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'author', type: 'text', defaultValue: 'FinOracles Team', admin: { position: 'sidebar' } },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
  ],
}
