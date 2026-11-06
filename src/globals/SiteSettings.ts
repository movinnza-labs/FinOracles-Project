import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: { group: 'Globals', description: 'Company details used across the header, footer, contact section and SEO.' },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'siteName', type: 'text', required: true, defaultValue: 'FinOracles' },
                { name: 'legalName', type: 'text', required: true, defaultValue: 'FinOracles Services Pvt. Ltd.' },
              ],
            },
            { name: 'tagline', type: 'text', defaultValue: 'Wings for a Wealthy Future' },
            { name: 'logo', type: 'upload', relationTo: 'media' },
            {
              name: 'defaultDescription',
              type: 'textarea',
              admin: { description: 'Fallback meta description for pages without their own.' },
            },
            {
              name: 'defaultOgImage',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Fallback social sharing image (1200×630 recommended).' },
            },
            { name: 'twitterHandle', type: 'text', admin: { description: 'e.g. @finoracles' } },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'phones',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'display', type: 'text', required: true, admin: { description: '+91 920 930 9822' } },
                    { name: 'number', type: 'text', required: true, admin: { description: '+919209309822' } },
                  ],
                },
              ],
            },
            { name: 'emails', type: 'array', fields: [{ name: 'email', type: 'email', required: true }] },
            {
              name: 'address',
              type: 'group',
              fields: [
                { name: 'full', type: 'textarea', label: 'Full address (as displayed)' },
                {
                  type: 'row',
                  fields: [
                    { name: 'street', type: 'text' },
                    { name: 'locality', type: 'text', label: 'City' },
                    { name: 'region', type: 'text', label: 'State' },
                    { name: 'postalCode', type: 'text' },
                    { name: 'country', type: 'text', defaultValue: 'IN' },
                  ],
                },
                { name: 'mapUrl', type: 'text', label: 'Google Maps link' },
              ],
            },
            { name: 'businessHours', type: 'text', defaultValue: 'Monday - Saturday: 9:00 AM - 7:00 PM' },
            {
              name: 'openingHours',
              type: 'text',
              defaultValue: 'Mo-Sa 09:00-19:00',
              admin: { description: 'Machine-readable hours for schema.org, e.g. Mo-Sa 09:00-19:00' },
            },
            {
              name: 'whatsapp',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'number', type: 'text', admin: { description: 'Digits only, e.g. 919209309822' } },
                    { name: 'message', type: 'text', defaultValue: 'Hello FinOracles' },
                  ],
                },
              ],
            },
            {
              name: 'socials',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      required: true,
                      options: ['facebook', 'instagram', 'linkedin', 'youtube', 'whatsapp', 'x'].map((v) => ({
                        label: v === 'x' ? 'X (Twitter)' : v.charAt(0).toUpperCase() + v.slice(1),
                        value: v,
                      })),
                    },
                    { name: 'url', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Compliance',
          fields: [
            {
              name: 'registration',
              type: 'group',
              fields: [
                { name: 'registeredName', type: 'text', defaultValue: 'FINORACLES SERVICES PVT LTD' },
                { name: 'statement', type: 'text', defaultValue: 'AMFI- Registered Mutual Fund Distributor' },
                {
                  type: 'row',
                  fields: [
                    { name: 'arn', type: 'text', label: 'ARN' },
                    { name: 'initialRegistration', type: 'text', label: 'Date of Initial Registration' },
                    { name: 'validity', type: 'text', label: 'Current Validity' },
                  ],
                },
              ],
            },
            {
              name: 'regulators',
              type: 'array',
              labels: { singular: 'Regulatory body', plural: 'Regulatory bodies' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true },
                    { name: 'url', type: 'text', required: true },
                  ],
                },
              ],
            },
            {
              name: 'disclaimer',
              type: 'text',
              defaultValue:
                'Mutual Fund investments are subject to market risks, read all scheme related documents carefully.',
            },
          ],
        },
      ],
    },
  ],
}
