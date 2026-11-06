import path from 'node:path'
import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    description: 'Images used across the site. Always fill in the alt text for accessibility and SEO.',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    // On the VPS, MEDIA_DIR=media is bind-mounted from /srv/finoracles/media so uploads survive deploys.
    // Ignored when the S3 storage adapter is enabled in payload.config.ts.
    staticDir: path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.MEDIA_DIR || 'media'),
    mimeTypes: ['image/*'],
    focalPoint: true,
    formatOptions: { format: 'webp', options: { quality: 82 } },
    imageSizes: [
      { name: 'thumbnail', width: 320, height: 320, position: 'centre' },
      { name: 'card', width: 768 },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Describe the image for screen readers and search engines.' },
    },
    { name: 'caption', type: 'text' },
  ],
}
