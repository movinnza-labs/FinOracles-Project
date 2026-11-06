/** Public origin of the site, without a trailing slash. */
export const getServerURL = (): string => {
  const url =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    'http://localhost:3000'
  return url.replace(/\/$/, '')
}

/** Absolute URL for a site path. */
export const absoluteURL = (path = '/'): string => {
  if (/^https?:\/\//.test(path)) return path
  return `${getServerURL()}${path.startsWith('/') ? path : `/${path}`}`
}

/** Admin "Preview" button target: enables Next.js draft mode, then opens the page. */
export const previewPath = (path: string): string =>
  `${getServerURL()}/preview?path=${encodeURIComponent(path)}`

export const isExternal = (url?: string | null): boolean => !!url && /^https?:\/\//.test(url)
