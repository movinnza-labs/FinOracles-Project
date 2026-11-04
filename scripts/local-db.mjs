/**
 * Starts / stops the project-local PostgreSQL cluster in ./.pgdata (port 5433).
 *   npm run db:start | db:stop | db:status
 * Finds pg_ctl on PATH or in the default Windows install (C:\Program Files\PostgreSQL\<ver>\bin).
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

const DATA_DIR = path.resolve('.pgdata')
const PORT = 5433

const findPgCtl = () => {
  const root = 'C:\\Program Files\\PostgreSQL'
  if (process.platform === 'win32' && existsSync(root)) {
    const versions = readdirSync(root).sort((a, b) => Number(b) - Number(a))
    for (const v of versions) {
      const exe = path.join(root, v, 'bin', 'pg_ctl.exe')
      if (existsSync(exe)) return exe
    }
  }
  return 'pg_ctl'
}

const command = process.argv[2]
if (!['start', 'stop', 'status'].includes(command)) {
  console.error('Usage: node scripts/local-db.mjs <start|stop|status>')
  process.exit(1)
}
if (!existsSync(DATA_DIR)) {
  console.error(`No local cluster at ${DATA_DIR}. Create one with initdb (see README).`)
  process.exit(1)
}

const args = ['-D', DATA_DIR]
if (command === 'start') args.push('-o', `-p ${PORT}`, '-l', path.join(DATA_DIR, 'server.log'), '-w')
args.push(command)

const pgCtl = findPgCtl()
// The server inherits any stdout/stderr handle of `pg_ctl start` and keeps it open, so a
// captured or inherited stream would never close; start runs silently, then reports status.
const result = spawnSync(pgCtl, args, {
  stdio: command === 'start' ? 'ignore' : 'inherit',
})
if (command === 'start') {
  if (result.status !== 0) console.error(`Failed to start; see ${path.join(DATA_DIR, 'server.log')}`)
  spawnSync(pgCtl, ['-D', DATA_DIR, 'status'], { stdio: 'inherit' })
}
process.exit(result.status ?? 1)
