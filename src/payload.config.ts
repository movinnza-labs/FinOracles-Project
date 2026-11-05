import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig, type Plugin } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import sharp from 'sharp'

import { Categories } from './collections/Categories'
import { Enquiries } from './collections/Enquiries'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Products } from './collections/Products'
import { Services } from './collections/Services'
import { TeamMembers } from './collections/TeamMembers'
import { Users } from './collections/Users'
import { Footer } from './globals/Footer'
import { Header } from './globals/Header'
import { HomePage } from './globals/HomePage'
import { SiteSettings } from './globals/SiteSettings'
import { getServerURL } from './lib/url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.PAYLOAD_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('PAYLOAD_SECRET is not set. Add it to the production .env (see deploy/hostinger/env.production.example).')
}

if (!process.env.DATABASE_URL) {
  console.warn(
    '[payload] DATABASE_URL is not set. Copy .env.example to .env and add your PostgreSQL connection string. ' +
      'The site will show its built-in default content until a database is connected.',
  )
}

const serverURL = getServerURL()

const plugins: Plugin[] = [
  seoPlugin({
    uploadsCollection: 'media',
    // Products use `name` rather than `title`.
    generateTitle: ({ doc }) => {
      const title = doc?.title ?? doc?.name
      return title ? `${title} | FinOracles` : 'FinOracles'
    },
    generateURL: ({ doc, collectionSlug }) => {
      const bases: Record<string, string> = { posts: '/blog/', services: '/services/', products: '/products/' }
      return `${serverURL}${bases[collectionSlug ?? ''] ?? '/'}${doc?.slug ?? ''}`
    },
  }),
]

// S3-compatible storage (R2 / AWS S3). Without S3_BUCKET, uploads are written to MEDIA_DIR on disk.
if (process.env.S3_BUCKET) {
  plugins.push(
    s3Storage({
      collections: { media: true },
      bucket: process.env.S3_BUCKET,
      config: {
        region: process.env.S3_REGION || 'auto',
        endpoint: process.env.S3_ENDPOINT || undefined,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  )
}

export default buildConfig({
  serverURL,
  secret: process.env.PAYLOAD_SECRET || 'dev-only-secret-change-me',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' — FinOracles CMS',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/icon.svg' }],
    },
    // Browser extensions (e.g. QuillBot, Grammarly) add attributes to <html>; without this React
    // reports a hydration mismatch. It only covers <html>'s own attributes.
    suppressHydrationWarning: true,
    // Paths are relative to importMap.baseDir (src); run `npm run generate:importmap` after changes.
    components: {
      graphics: {
        Logo: '/components/admin/Logo',
        Icon: '/components/admin/Icon',
      },
      beforeLogin: ['/components/admin/LoginIntro'],
      afterLogin: ['/components/admin/LoginFooter'],
      beforeNavLinks: ['/components/admin/NavBrand'],
      actions: ['/components/admin/HeaderActions'],
      beforeDashboard: ['/components/admin/DashboardWelcome'],
    },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 820, height: 1180 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections: [Pages, Posts, Categories, Services, Products, TeamMembers, Media, Enquiries, Users],
  globals: [HomePage, Header, Footer, SiteSettings],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: Number(process.env.DATABASE_POOL_MAX || 10),
    },
    // Production schema changes are applied by `npm run migrate` (run by deploy/hostinger/deploy.sh);
    // in development Payload pushes the schema automatically.
    push: process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'no-reply@finoracles.com',
        defaultFromName: process.env.EMAIL_FROM_NAME || 'FinOracles Website',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        },
      })
    : undefined,
  cors: [serverURL],
  csrf: [serverURL],
  sharp,
  plugins,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  graphQL: { disable: true },
  onInit: async (payload) => {
    // Optional first-boot seed. Never during `payload migrate` (tables may not exist yet),
    // and a failure must not take the site down.
    if (process.env.SEED_ON_INIT !== 'true' || process.env.PAYLOAD_MIGRATING === 'true') return
    try {
      const { seed } = await import('./seed')
      await seed(payload, { onlyIfEmpty: true })
    } catch (err) {
      payload.logger.error({ err, msg: 'Initial seed failed; run `npm run seed` manually.' })
    }
  },
})
