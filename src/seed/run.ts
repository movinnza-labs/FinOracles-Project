/**
 * CLI entry: `npm run seed` (safe, skips if content exists)
 *            `SEED_FORCE=true npm run seed` (wipes content collections and re-seeds)
 */
import config from '@payload-config'
import { getPayload } from 'payload'
import { seed } from './index'

const payload = await getPayload({ config })

try {
  await seed(payload, { onlyIfEmpty: process.env.SEED_FORCE !== 'true' })
  process.exit(0)
} catch (err) {
  payload.logger.error({ err, msg: 'Seed failed' })
  process.exit(1)
}
