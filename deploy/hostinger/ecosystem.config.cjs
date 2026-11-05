/**
 * PM2 process file for a Hostinger VPS.
 *   pm2 start deploy/hostinger/ecosystem.config.cjs   (first time)
 *   pm2 reload finoracles                             (after each deploy; zero downtime)
 *
 * Next.js reads .env from the app directory, so secrets stay in /var/www/finoracles/app/.env
 * and are not repeated here. `.cjs` because package.json sets "type": "module".
 */
module.exports = {
  apps: [
    {
      name: 'finoracles',
      cwd: '/var/www/finoracles/app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000 -H 127.0.0.1',
      // One process: Payload keeps a DB pool per process and the enquiry throttle is in-memory.
      instances: 1,
      exec_mode: 'fork',
      node_args: '--no-deprecation',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '1G',
      restart_delay: 3000,
      kill_timeout: 10000,
      time: true,
      out_file: '/var/www/finoracles/logs/out.log',
      error_file: '/var/www/finoracles/logs/error.log',
    },
  ],
}
