import type { ArrayField } from 'payload'

/**
 * "Learn more" internal links shown on a product or service page, e.g. to a related product,
 * a blog article or the calculators. Helps visitors and search engines find related pages.
 */
export const relatedLinksField = (): ArrayField => ({
  name: 'relatedLinks',
  type: 'array',
  label: 'Learn more links',
  maxRows: 6,
  admin: {
    description: 'Links to related pages on this site, shown under the main content, e.g. "Try the SIP calculator" → /tools.',
    initCollapsed: true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'label', type: 'text', required: true, admin: { width: '50%' } },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: { width: '50%', description: 'A path on this site, e.g. /blog/why-sip-builds-wealth' },
        },
      ],
    },
  ],
})
