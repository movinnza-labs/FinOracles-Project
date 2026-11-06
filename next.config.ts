import type { NextConfig } from 'next'

/**
 * Two ways to host on Hostinger, from the same code:
 *
 * 1. Node.js Web App (deploy from GitHub): `npm run build` + `npm start` (next start).
 *    Every page is still prerendered to static HTML; the only server code is the
 *    contact form at /contact.php (src/app/contact.php/route.node.ts).
 *
 * 2. Static upload to public_html: `npm run package` sets STATIC_EXPORT=1, exports
 *    plain files to out/, adds hosting/.htaccess and hosting/contact.php (PHP form
 *    handler) and zips it. The Node route is left out of that build.
 */
const isStaticExport = process.env.STATIC_EXPORT === '1'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: 'export' as const } : {}),
  // Files named *.node.ts(x) only exist in the Node.js build.
  pageExtensions: isStaticExport ? ['tsx', 'ts'] : ['tsx', 'ts', 'node.ts'],
  // /about → /about/ (out/about/index.html in the static export).
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // Images in /public are already sized WebP; no image server needed (and none on static hosting).
    unoptimized: true,
  },
  // Static export ignores headers(); hosting/.htaccess sets them there.
  ...(isStaticExport
    ? {}
    : {
        async headers() {
          return [
            { source: '/:path*', headers: securityHeaders },
            { source: '/images/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
          ]
        },
        async redirects() {
          return [
            { source: '/admin/:path*', destination: '/', permanent: true },
            { source: '/admin', destination: '/', permanent: true },
          ]
        },
      }),
}

export default nextConfig
