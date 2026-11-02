import type { Tab } from 'payload'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

/** "SEO" admin tab shared by pages, posts, services and the homepage global. */
export const seoTab: Tab = {
  name: 'meta',
  label: 'SEO',
  fields: [
    OverviewField({
      titlePath: 'meta.title',
      descriptionPath: 'meta.description',
      imagePath: 'meta.image',
    }),
    MetaTitleField({ hasGenerateFn: true }),
    MetaDescriptionField({}),
    MetaImageField({ relationTo: 'media' }),
    PreviewField({
      hasGenerateFn: true,
      titlePath: 'meta.title',
      descriptionPath: 'meta.description',
    }),
    {
      name: 'canonicalURL',
      type: 'text',
      label: 'Canonical URL',
      admin: { description: 'Optional. Leave empty to use this page’s own URL.' },
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      label: 'Hide from search engines (noindex)',
      defaultValue: false,
    },
  ],
}
