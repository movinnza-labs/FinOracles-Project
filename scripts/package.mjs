// Builds the static version of the site for upload to Hostinger public_html and zips it.
//   out/  = plain HTML/CSS/JS + hosting/.htaccess + hosting/contact.php
// Uses the `tar` that ships with Windows 10+ and macOS (bsdtar), which writes
// forward-slash paths that Hostinger's File Manager extracts correctly.
import { execSync, execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, rmSync } from 'node:fs'

rmSync('out', { recursive: true, force: true })
execSync('npx next build', {
  stdio: 'inherit',
  env: { ...process.env, STATIC_EXPORT: '1', NODE_OPTIONS: '--no-deprecation' },
})
if (!existsSync('out/index.html')) {
  console.error('Static export failed: out/index.html not found.')
  process.exit(1)
}
copyFileSync('hosting/.htaccess', 'out/.htaccess')
copyFileSync('hosting/contact.php', 'out/contact.php')

const zip = 'finoracles-site.zip'
rmSync(zip, { force: true })
try {
  execFileSync('tar', ['-a', '-c', '-f', zip, '-C', 'out', '.'], { stdio: 'inherit' })
} catch {
  console.error('Could not create the zip with tar. Zip the CONTENTS of out/ manually (include .htaccess).')
  process.exit(1)
}
console.log(`\nCreated ${zip}. Upload it to public_html in Hostinger File Manager and extract it there.`)
