import { draftMode, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/queries'

/**
 * Admin "Preview" target. Only a signed-in CMS user can enable draft mode.
 *   /preview?path=/blog/my-post   -> enable drafts and open the page
 *   /preview?disable=1&path=/     -> leave preview mode
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const rawPath = url.searchParams.get('path') || '/'
  // Only allow same-site relative paths. Browsers treat "\" like "/", so "/\evil.com"
  // would otherwise leave the site; resolve against our origin and compare.
  const target = new URL(rawPath, url.origin)
  const path =
    rawPath.startsWith('/') && !rawPath.includes('\\') && target.origin === url.origin
      ? `${target.pathname}${target.search}${target.hash}`
      : '/'
  const draft = await draftMode()

  if (url.searchParams.get('disable')) {
    draft.disable()
    redirect(path)
  }

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return new Response('You must be logged in to the CMS to preview drafts.', { status: 403 })

  draft.enable()
  redirect(path)
}
