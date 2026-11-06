import { getPayloadClient } from '@/lib/queries'

/** Health check (Docker healthcheck, watchdog, uptime monitor): confirms the app is up and the database is reachable. */
export async function GET() {
  try {
    const payload = await getPayloadClient()
    await payload.count({ collection: 'users' })
    return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ status: 'error' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
