import type { Field, GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { iconField } from '../fields/icon'
import { linkFields } from '../fields/link'
import { seoTab } from '../fields/seo'
import { revalidateGlobal } from '../hooks/revalidate'

const heading = (defaultValue?: string): Field => ({ name: 'heading', type: 'text', defaultValue })
const lead: Field = {
  name: 'lead',
  type: 'textarea',
  admin: { description: 'Separate paragraphs with a blank line.' },
}
const enabled: Field = {
  name: 'enabled',
  type: 'checkbox',
  defaultValue: true,
  label: 'Show this section',
}
const paragraphs = (name = 'body', description = 'Separate paragraphs with a blank line.'): Field => ({
  name,
  type: 'textarea',
  admin: { description },
})

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Homepage',
  admin: {
    group: 'Globals',
    description: 'Every section of the homepage. Products, team and services are managed in their own collections.',
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'hero',
          label: 'Hero',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'badgeText', type: 'text', defaultValue: 'AMFI- Registered Mutual Fund Distributor' },
                { name: 'badgeHighlight', type: 'text', defaultValue: 'ARN 300933' },
              ],
            },
            {
              name: 'titlePrefix',
              type: 'text',
              admin: { description: 'Read by screen readers and search engines before the headline (visually hidden).' },
            },
            { name: 'title', type: 'text', required: true, defaultValue: 'Wings for a Wealthy Future' },
            { name: 'lead', type: 'textarea' },
            { name: 'primaryCta', type: 'group', fields: linkFields },
            { name: 'showPhoneButton', type: 'checkbox', defaultValue: true },
            {
              name: 'figures',
              type: 'array',
              maxRows: 3,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'value', type: 'text', required: true },
                    { name: 'label', type: 'text', required: true },
                  ],
                },
              ],
            },
            {
              name: 'slides',
              type: 'array',
              label: 'Goal carousel',
              admin: { description: 'Rotating goal cards beside the headline.', initCollapsed: true },
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'titleAccent', type: 'text', admin: { description: 'Highlighted second word.' } },
                  ],
                },
                { name: 'description', type: 'text' },
                paragraphs('more', 'Shown when "Learn more" is opened. Separate paragraphs with a blank line.'),
                {
                  name: 'headline',
                  type: 'text',
                  admin: { description: 'Big hero headline shown while this slide is active. Empty = main hero title.' },
                },
                {
                  name: 'lead',
                  type: 'textarea',
                  label: 'Intro text',
                  admin: { description: 'Text under the headline for this slide. Empty = main hero intro.' },
                },
              ],
            },
          ],
        },
        {
          name: 'whatWeDo',
          label: 'What We Do',
          fields: [
            enabled,
            heading('What We Do'),
            {
              name: 'items',
              type: 'array',
              maxRows: 3,
              fields: [iconField(), { name: 'title', type: 'text', required: true }, { name: 'text', type: 'textarea' }],
            },
          ],
        },
        {
          name: 'needs',
          label: 'Financial Needs',
          fields: [
            enabled,
            heading('WHAT ARE YOUR FINANCIAL NEEDS?'),
            lead,
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'image', type: 'upload', relationTo: 'media' },
                iconField({ admin: { description: 'Used when no image is set.' } }),
                {
                  name: 'url',
                  type: 'text',
                  admin: { description: 'Where the card links, e.g. /products/nps or /contact?goal=retirement' },
                },
              ],
            },
          ],
        },
        {
          name: 'guidance',
          label: 'Guidance',
          fields: [
            enabled,
            heading('GET PERSONALISED GUIDANCE'),
            { name: 'subheading', type: 'text' },
            { name: 'quote', type: 'textarea' },
            { name: 'lead', type: 'textarea' },
            {
              name: 'steps',
              type: 'array',
              fields: [iconField(), { name: 'title', type: 'text', required: true }, { name: 'text', type: 'textarea' }],
            },
          ],
        },
        {
          name: 'products',
          label: 'Products',
          description: 'The product list itself is managed in Content → Products.',
          fields: [
            enabled,
            heading('Our Products'),
            lead,
            {
              name: 'ctaUrl',
              type: 'text',
              defaultValue: '#contact',
              admin: { description: 'Where the "Enquire about…" button scrolls to. The contact form subject is pre-filled with the product.' },
            },
          ],
        },
        {
          name: 'about',
          label: 'About',
          fields: [
            enabled,
            { name: 'image', type: 'upload', relationTo: 'media' },
            {
              type: 'row',
              fields: [
                { name: 'badgeValue', type: 'text', defaultValue: '15+' },
                { name: 'badgeLabel', type: 'text', defaultValue: 'Years of Expertise' },
              ],
            },
            { name: 'eyebrow', type: 'text', defaultValue: 'Who We Are?' },
            {
              type: 'row',
              fields: [
                { name: 'headingStart', type: 'text' },
                { name: 'headingAccent', type: 'text' },
                { name: 'headingEnd', type: 'text' },
              ],
            },
            { name: 'intro', type: 'textarea', admin: { description: 'First paragraph, set in darker text.' } },
            paragraphs('body'),
            {
              name: 'values',
              type: 'array',
              maxRows: 4,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'text', type: 'text' },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'team',
          label: 'Team',
          description: 'Team members are managed in Content → Team.',
          fields: [enabled, heading('Meet Our Team'), lead],
        },
        {
          name: 'expertise',
          label: 'Expertise & Vision',
          fields: [
            enabled,
            heading('Core Expertise'),
            lead,
            {
              name: 'items',
              type: 'array',
              fields: [iconField(), { name: 'label', type: 'text', required: true }],
            },
            paragraphs('body'),
            { name: 'image', type: 'upload', relationTo: 'media' },
            {
              name: 'vision',
              type: 'group',
              fields: [
                { name: 'heading', type: 'text', defaultValue: 'Our Vision' },
                { name: 'text', type: 'textarea' },
                { name: 'tagline', type: 'text' },
              ],
            },
          ],
        },
        {
          name: 'services',
          label: 'Services',
          description: 'Services are managed in Content → Services (tick "Show on homepage").',
          fields: [enabled, heading('Our Services'), lead],
        },
        {
          name: 'resources',
          label: 'Resources',
          fields: [
            enabled,
            heading('Resources'),
            lead,
            {
              name: 'items',
              type: 'array',
              maxRows: 8,
              fields: [
                iconField(),
                { name: 'title', type: 'text', required: true },
                { name: 'text', type: 'textarea' },
                { name: 'url', type: 'text', admin: { description: 'Optional link, e.g. /blog' } },
              ],
            },
          ],
        },
        {
          name: 'tools',
          label: 'Tools',
          fields: [
            enabled,
            heading('Financial Tools'),
            lead,
            {
              name: 'card',
              type: 'group',
              fields: [
                iconField({ defaultValue: 'calculator' }),
                { name: 'title', type: 'text' },
                { name: 'text', type: 'textarea' },
                ...linkFields,
              ],
            },
          ],
        },
        {
          name: 'logins',
          label: 'Logins',
          fields: [
            enabled,
            heading('Access Your Account'),
            lead,
            { name: 'items', type: 'array', fields: linkFields },
          ],
        },
        {
          name: 'contact',
          label: 'Contact',
          description: 'Address, phones and emails come from Site Settings.',
          fields: [
            enabled,
            heading('Contact Us'),
            lead,
            { name: 'formHeading', type: 'text', defaultValue: 'Send us a Message' },
          ],
        },
        {
          name: 'stats',
          label: 'Stats',
          fields: [
            enabled,
            {
              name: 'items',
              type: 'array',
              maxRows: 4,
              fields: [
                iconField(),
                {
                  type: 'row',
                  fields: [
                    { name: 'value', type: 'number', required: true },
                    { name: 'suffix', type: 'text' },
                    { name: 'label', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },
        seoTab,
      ],
    },
  ],
}
