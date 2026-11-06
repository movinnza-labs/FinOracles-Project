import type { NextConfig } from 'next'

/**
 * The site is exported as plain static files (`npm run build` → `out/`), which are
 * uploaded to Hostinger's public_html. No Node.js server or database is needed.
 * Security and cache headers live in public/.htaccess (Next's headers() does not
 * apply to static exports).
 */
const nextConfig: NextConfig = {
  output: 'export',
  // /about → out/about/index.html, which Apache serves without rewrite rules.
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // There is no image server on static hosting; the images in /public are already WebP.
    unoptimized: true,
  },
}

export default nextConfig
