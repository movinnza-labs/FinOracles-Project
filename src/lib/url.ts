/** Public origin of the site, without a trailing slash. Baked in at build time. */
export const getServerURL = (): string => {
  const url = process.env.NEXT_PUBLIC_SERVER_URL || 'https://finoracles.com'
  return url.replace(/\/$/, '')
}

/**
 * Pages are exported as folders (trailingSlash: true), so /about is served at /about/.
 * Canonical and sitemap URLs use that final form. Files (sitemap.xml, images) and
 * URLs with a query or hash are left as they are.
 */
const withSlash = (path: string) => (/[?#]|\/$|\.[a-z0-9]+$/i.test(path) ? path : `${path}/`)

/** Absolute URL for a site path. */
export const absoluteURL = (path = '/'): string => {
  if (/^https?:\/\//.test(path)) return path
  return `${getServerURL()}${withSlash(path.startsWith('/') ? path : `/${path}`)}`
}

export const isExternal = (url?: string | null): boolean => !!url && /^https?:\/\//.test(url)
