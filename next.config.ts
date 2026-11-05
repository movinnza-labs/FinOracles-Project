import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
  new URL(`${serverURL}/**`),
]

// Allow media served straight from an S3-compatible bucket (e.g. Cloudflare R2).
if (process.env.S3_PUBLIC_URL) remotePatterns.push(new URL(`${process.env.S3_PUBLIC_URL.replace(/\/$/, '')}/**`))

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Caps build workers (and the database connections they would open).
  experimental: { cpus: 4 },
  images: {
    // AVIF costs much more CPU and memory to generate than WebP.
    formats: ['image/webp'],
    qualities: [75, 85],
    // Generate each image size once; uploads get unique filenames, so stale copies are not a risk.
    minimumCacheTTL: 60 * 60 * 24 * 365,
    // Defaults minus 2048 and 3840, which no layout here needs.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    localPatterns: [{ pathname: '/images/**' }, { pathname: '/api/media/file/**' }],
    remotePatterns,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
