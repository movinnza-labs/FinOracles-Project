import type { Block, Field } from 'payload'
import { iconField } from '../fields/icon'
import { ctaFields, linkGroup } from '../fields/link'

const sectionHeadFields: Field[] = [
  { name: 'eyebrow', type: 'text' },
  { name: 'heading', type: 'text' },
  { name: 'lead', type: 'textarea' },
]

const background: Field = {
  name: 'background',
  type: 'select',
  defaultValue: 'white',
  options: [
    { label: 'White', value: 'white' },
    { label: 'Tinted', value: 'tinted' },
    { label: 'Navy', value: 'navy' },
  ],
}

export const ContentBlock: Block = {
  slug: 'content',
  labels: { singular: 'Rich text', plural: 'Rich text' },
  interfaceName: 'ContentBlock',
  fields: [
    ...sectionHeadFields,
    { name: 'body', type: 'richText', required: true },
    {
      name: 'width',
      type: 'select',
      defaultValue: 'narrow',
      options: [
        { label: 'Narrow (reading width)', value: 'narrow' },
        { label: 'Full container', value: 'full' },
      ],
    },
    background,
  ],
}

export const MediaContentBlock: Block = {
  slug: 'mediaContent',
  labels: { singular: 'Image + text', plural: 'Image + text' },
  interfaceName: 'MediaContentBlock',
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
    },
    ...sectionHeadFields,
    { name: 'body', type: 'richText' },
    { name: 'links', type: 'array', maxRows: 2, fields: ctaFields },
    background,
  ],
}

export const CardsBlock: Block = {
  slug: 'cards',
  labels: { singular: 'Card grid', plural: 'Card grids' },
  interfaceName: 'CardsBlock',
  fields: [
    ...sectionHeadFields,
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: ['2', '3', '4'].map((v) => ({ label: `${v} columns`, value: v })),
    },
    {
      name: 'cards',
      type: 'array',
      minRows: 1,
      fields: [
        iconField(),
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'textarea' },
        linkGroup('link', { admin: { description: 'Optional link for the whole card.' } }),
      ],
    },
    background,
  ],
}

export const CTABlock: Block = {
  slug: 'cta',
  labels: { singular: 'Call to action', plural: 'Calls to action' },
  interfaceName: 'CTABlock',
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'text', type: 'textarea' },
    { name: 'links', type: 'array', maxRows: 2, fields: ctaFields },
  ],
}

export const StatsBlock: Block = {
  slug: 'stats',
  labels: { singular: 'Stats strip', plural: 'Stats strips' },
  interfaceName: 'StatsBlock',
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      fields: [
        iconField(),
        { name: 'value', type: 'number', required: true },
        { name: 'suffix', type: 'text', admin: { description: 'e.g. + or %' } },
        { name: 'label', type: 'text', required: true },
      ],
    },
  ],
}

export const FAQBlock: Block = {
  slug: 'faq',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  interfaceName: 'FAQBlock',
  fields: [
    ...sectionHeadFields,
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
    background,
  ],
}

export const ServicesBlock: Block = {
  slug: 'servicesGrid',
  labels: { singular: 'Services grid', plural: 'Services grids' },
  interfaceName: 'ServicesGridBlock',
  fields: [...sectionHeadFields, background],
}

export const LatestPostsBlock: Block = {
  slug: 'latestPosts',
  labels: { singular: 'Latest blog posts', plural: 'Latest blog posts' },
  interfaceName: 'LatestPostsBlock',
  fields: [
    ...sectionHeadFields,
    { name: 'limit', type: 'number', defaultValue: 3, min: 1, max: 12 },
    background,
  ],
}

export const EnquiryFormBlock: Block = {
  slug: 'enquiryForm',
  labels: { singular: 'Contact form', plural: 'Contact forms' },
  interfaceName: 'EnquiryFormBlock',
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Contact Us' },
    { name: 'lead', type: 'textarea' },
    { name: 'formHeading', type: 'text', defaultValue: 'Send us a Message' },
    {
      name: 'showContactDetails',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Show address, phone, email and hours from Site Settings.' },
    },
  ],
}

export const pageBlocks: Block[] = [
  ContentBlock,
  MediaContentBlock,
  CardsBlock,
  ServicesBlock,
  StatsBlock,
  FAQBlock,
  LatestPostsBlock,
  CTABlock,
  EnquiryFormBlock,
]
