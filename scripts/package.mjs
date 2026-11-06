// Zips the static export (out/) into finoracles-site.zip for upload to Hostinger.
// Uses the `tar` that ships with Windows 10+ and macOS (bsdtar), which writes
// forward-slash paths that Hostinger's File Manager extracts correctly.
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'

const zip = 'finoracles-site.zip'
if (!existsSync('out/index.html')) {
  console.error('out/ not found. Run `npm run build` first.')
  process.exit(1)
}
rmSync(zip, { force: true })
try {
  execFileSync('tar', ['-a', '-c', '-f', zip, '-C', 'out', '.'], { stdio: 'inherit' })
} catch {
  console.error('Could not create the zip with tar. Zip the CONTENTS of out/ manually (include .htaccess).')
  process.exit(1)
}
console.log(`\nCreated ${zip}. Upload it to public_html in Hostinger File Manager and extract it there.`)
