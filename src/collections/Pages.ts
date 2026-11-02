import type { CollectionConfig } from 'payload'
import { authenticated, authenticatedOrPublished } from '../access'
import { pageBlocks } from '../blocks'
import { seoTab } from '../fields/seo'
import { slugField } from '../fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'
import { previewPath } from '../lib/url'

/** Reserved by other routes; a page cannot use these slugs. */
const reservedSlugs = ['admin', 'api', 'blog', 'services', 'preview', 'healthz', 'sitemap.xml', 'robots.txt']

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Content',
    description: 'Standalone pages (e.g. /privacy-policy). The homepage is edited under Globals → Homepage.',
    preview: (doc) => previewPath(`/${doc?.slug ?? ''}`),
  },
  access: {
    read: authenticatedOrPublished,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 25 },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollectionDelete] },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          name: 'hero',
          fields: [
            { name: 'eyebrow', type: 'text' },
            {
              name: 'heading',
              type: 'text',
              admin: { description: 'Main H1. Defaults to the page title.' },
            },
            { name: 'lead', type: 'textarea' },
          ],
        },
        {
          label: 'Content',
          fields: [{ name: 'layout', type: 'blocks', blocks: pageBlocks }],
        },
        seoTab,
      ],
    },
    {
      ...slugField('title'),
      validate: (value: unknown) =>
        typeof value === 'string' && reservedSlugs.includes(value)
          ? `"${value}" is reserved by the website. Choose another slug.`
          : true,
    },
  ],
}
