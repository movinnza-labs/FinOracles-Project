import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'

/**
 * Messages sent through the website contact form. Created server-side by the
 * enquiry server action; the public API cannot create or read them.
 */
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['name', 'email', 'subject', 'status', 'createdAt'],
    group: 'Admin',
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
            replyTo: doc.email,
            subject: `Website enquiry: ${doc.subject}`,
            text: `Name: ${doc.name}\nEmail: ${doc.email}\nPhone: ${doc.phone || '-'}\n\n${doc.message}`,
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
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
      ],
    },
    { name: 'subject', type: 'text', required: true },
    { name: 'message', type: 'textarea', required: true },
    { name: 'page', type: 'text', admin: { readOnly: true, description: 'Page the form was sent from.' } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'In progress', value: 'in-progress' },
        { label: 'Closed', value: 'closed' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
