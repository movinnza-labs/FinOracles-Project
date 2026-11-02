import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
  new URL(`${serverURL}/**`),
]

// Allow media served straight from an S3-compatible bucket (e.g. Railway Buckets).
if (process.env.S3_PUBLIC_URL) remotePatterns.push(new URL(`${process.env.S3_PUBLIC_URL.replace(/\/$/, '')}/**`))

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85],
    minimumCacheTTL: 60 * 60 * 24 * 30,
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
