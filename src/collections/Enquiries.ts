import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'

/**
 * Messages sent through the website enquiry form. Created server-side by the
 * enquiry server action; the public API cannot create or read them.
 */
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'interest', 'callbackTime', 'status', 'createdAt'],
    group: 'Admin',
    description: 'Leads from the website. Update the status as you follow up.',
  },
  defaultSort: '-createdAt',
  access: {
    create: () => false,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create' || !process.env.SMTP_HOST) return doc
        const to = process.env.ENQUIRY_NOTIFY_TO
        if (!to) return doc
        try {
          await req.payload.sendEmail({
            to,
            replyTo: doc.email || undefined,
            subject: `New website enquiry: ${doc.interest || 'General'} — ${doc.name}`,
            text: [
              `Name: ${doc.name}`,
              `Phone: ${doc.phone}`,
              `Email: ${doc.email || '-'}`,
              `Interested in: ${doc.interest || '-'}`,
              `Preferred callback: ${doc.callbackTime || '-'}`,
              `Page: ${doc.page || '-'}`,
              '',
              doc.message || '(no message)',
            ].join('\n'),
          })
        } catch (err) {
          req.payload.logger.error({ err, msg: 'Failed to send enquiry notification email' })
        }
        return doc
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'email', type: 'email' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'interest', type: 'text', label: 'Interested in' },
        { name: 'callbackTime', type: 'text', label: 'Preferred callback time' },
      ],
    },
    { name: 'subject', type: 'text', admin: { description: 'Legacy field from the earlier form.' } },
    { name: 'message', type: 'textarea' },
    { name: 'page', type: 'text', admin: { readOnly: true, description: 'Page the form was sent from.' } },
    {
      name: 'consent',
      type: 'checkbox',
      label: 'Agreed to be contacted / privacy policy',
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'in-progress' },
        { label: 'Converted', value: 'converted' },
        { label: 'Closed', value: 'closed' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'notes', type: 'textarea', label: 'Internal notes', admin: { position: 'sidebar' } },
  ],
}
