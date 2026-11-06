/**
 * Production server for Hostinger's Node.js "Web App" hosting (deploy from GitHub).
 *
 * Serves the static export in out/ (built by `npm run build`) and handles the
 * contact form at POST /contact.php, which on this host can't run as PHP.
 * If you upload out/ to public_html instead, this file is not used: Apache serves
 * the files and public/contact.php handles the form.
 *
 * Environment (hPanel → Web App → Environment variables), all optional:
 *   PORT                  set by Hostinger
 *   SMTP_HOST=smtp.hostinger.com  SMTP_PORT=465  SMTP_USER=no-reply@finoracles.com  SMTP_PASS=...
 *   ENQUIRY_NOTIFY_TO=connect@finoracles.com   (where enquiries are emailed)
 *   ENQUIRY_DIR=/path/for/csv                  (default: ../finoracles-enquiries)
 */
import http from 'node:http'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import { Readable } from 'node:stream'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(here, 'out')
const PORT = Number(process.env.PORT) || 3000
const ENQUIRY_DIR = process.env.ENQUIRY_DIR || path.join(here, '..', 'finoracles-enquiries')
const NOTIFY_TO = process.env.ENQUIRY_NOTIFY_TO || 'connect@finoracles.com'
const MAX_BODY = 64 * 1024

if (!fs.existsSync(path.join(ROOT, 'index.html'))) {
  console.error('[server] out/index.html not found. Run `npm run build` before `npm start`.')
  process.exit(1)
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
}
const COMPRESSIBLE = new Set(['.html', '.txt', '.js', '.css', '.json', '.xml', '.svg'])

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

const send = (res, status, headers, body) => {
  res.writeHead(status, { ...SECURITY_HEADERS, ...headers })
  res.end(body)
}

/** Resolves a URL path to a file inside out/, or null. Blocks traversal and dotfiles. */
const resolveFile = async (urlPath) => {
  const rel = path.normalize(urlPath).replace(/^([/\\])+/, '')
  if (rel.split(/[/\\]/).some((part) => part.startsWith('.') && part !== '')) return null
  const file = path.join(ROOT, rel)
  if (!file.startsWith(ROOT)) return null
  try {
    const stat = await fsp.stat(file)
    if (stat.isDirectory()) return { dir: true, file: path.join(file, 'index.html') }
    return { dir: false, file }
  } catch {
    return null
  }
}

const serveFile = (req, res, file, status = 200) => {
  const ext = path.extname(file).toLowerCase()
  const immutable = req.url.startsWith('/_next/static/') || req.url.startsWith('/images/')
  const headers = {
    'Content-Type': TYPES[ext] || 'application/octet-stream',
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate',
  }
  const gzip = COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')
  if (gzip) {
    headers['Content-Encoding'] = 'gzip'
    headers.Vary = 'Accept-Encoding'
  }
  res.writeHead(status, { ...SECURITY_HEADERS, ...headers })
  if (req.method === 'HEAD') return res.end()
  const stream = fs.createReadStream(file)
  stream.on('error', () => res.destroy())
  ;(gzip ? stream.pipe(zlib.createGzip()) : stream).pipe(res)
}

const notFound = (req, res) => serveFile(req, res, path.join(ROOT, '404.html'), 404)

/* ---- Contact form ------------------------------------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const SUCCESS = { status: 'success', message: 'Thank you! Your request has been received. Our team will call you back shortly.' }
const FAILURE = { status: 'error', message: 'Sorry, something went wrong. Please call or WhatsApp us instead.' }

const hits = new Map()
const throttled = (ip) => {
  const now = Date.now()
  if (hits.size > 5000) hits.clear()
  const list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000)
  list.push(now)
  hits.set(ip, list)
  return list.length > 5
}

let transporter = null
const getTransporter = async () => {
  if (!process.env.SMTP_HOST) return null
  if (!transporter) {
    const { default: nodemailer } = await import('nodemailer')
    const port = Number(process.env.SMTP_PORT) || 465
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    })
  }
  return transporter
}

const csvCell = (v) => {
  const s = /^[=+\-@]/.test(v) ? `'${v}` : v
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const json = (res, status, body) =>
  send(res, status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, JSON.stringify(body))

const handleEnquiry = async (req, res) => {
  const origin = req.headers.origin
  if (origin && new URL(origin).host !== req.headers.host) return json(res, 403, { status: 'error', message: 'Request not allowed.' })
  if (Number(req.headers['content-length'] || 0) > MAX_BODY) return json(res, 413, FAILURE)

  let form
  try {
    let size = 0
    const limited = Readable.from(
      (async function* () {
        for await (const chunk of req) {
          size += chunk.length
          if (size > MAX_BODY) throw new Error('Body too large')
          yield chunk
        }
      })(),
    )
    form = await new Request('http://local/', {
      method: 'POST',
      headers: { 'content-type': req.headers['content-type'] || '' },
      body: Readable.toWeb(limited),
      duplex: 'half',
    }).formData()
  } catch {
    return json(res, 400, FAILURE)
  }

  const field = (name, max) => String(form.get(name) ?? '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim().slice(0, max)
  const line = (v) => v.replace(/[\r\n]+/g, ' ')
  const v = {
    name: line(field('name', 120)),
    phone: line(field('phone', 20)),
    email: line(field('email', 200)),
    interest: line(field('interest', 120)),
    callbackTime: line(field('callbackTime', 60)),
    message: field('message', 5000),
    page: line(field('page', 300)),
  }

  if (field('website', 200)) return json(res, 200, SUCCESS) // honeypot

  const errors = {}
  if (v.name.length < 2) errors.name = 'Please enter your name.'
  const digits = v.phone.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 13) errors.phone = 'Please enter a valid mobile number.'
  if (v.email && !EMAIL_RE.test(v.email)) errors.email = 'Please enter a valid email address.'
  if (form.get('consent') !== 'on') errors.consent = 'Please agree so we can contact you.'
  if (Object.keys(errors).length) return json(res, 422, { status: 'error', message: 'Please correct the highlighted fields.', errors })

  const ip = String(req.headers['x-forwarded-for'] || '').split(',').at(-1)?.trim() || req.socket.remoteAddress || 'unknown'
  if (throttled(ip)) return json(res, 429, { status: 'error', message: 'Too many requests. Please try again in a few minutes, or call us.' })

  const date = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })
  let saved = false
  let mailed = false

  try {
    await fsp.mkdir(ENQUIRY_DIR, { recursive: true })
    const csv = path.join(ENQUIRY_DIR, 'enquiries.csv')
    const header = fs.existsSync(csv) ? '' : 'Date (IST),Name,Phone,Email,Interested in,Best time to call,Message,Page,IP\n'
    const row = [date, v.name, v.phone, v.email, v.interest, v.callbackTime, v.message, v.page, ip].map(csvCell).join(',')
    await fsp.appendFile(csv, `${header}${row}\n`)
    saved = true
  } catch (err) {
    console.error('[enquiry] could not save CSV', err)
  }

  try {
    const mailer = await getTransporter()
    if (mailer) {
      await mailer.sendMail({
        from: { name: 'FinOracles Website', address: process.env.EMAIL_FROM || process.env.SMTP_USER },
        to: NOTIFY_TO,
        replyTo: v.email || undefined,
        subject: `New website enquiry: ${v.name}${v.interest ? ` (${v.interest})` : ''}`,
        text: [
          'New enquiry from the FinOracles website',
          '',
          `Name:              ${v.name}`,
          `Phone:             ${v.phone}`,
          `Email:             ${v.email || '-'}`,
          `Interested in:     ${v.interest || '-'}`,
          `Best time to call: ${v.callbackTime || '-'}`,
          `Page:              ${v.page || '-'}`,
          `Received:          ${date} IST`,
          '',
          'Message:',
          v.message || '-',
        ].join('\n'),
      })
      mailed = true
    }
  } catch (err) {
    console.error('[enquiry] could not send email', err)
  }

  if (!mailed && !process.env.SMTP_HOST) console.warn('[enquiry] SMTP_HOST not set; enquiry saved to CSV only')
  return json(res, saved || mailed ? 200 : 500, saved || mailed ? SUCCESS : FAILURE)
}

/* ---- Router --------------------------------------------------------------- */

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://local')
    let pathname
    try {
      pathname = decodeURIComponent(url.pathname)
    } catch {
      return notFound(req, res)
    }

    if (pathname === '/contact.php') {
      if (req.method === 'POST') return await handleEnquiry(req, res)
      return json(res, 405, { status: 'error', message: 'Method not allowed.' })
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { Allow: 'GET, HEAD' }, '')

    // Old CMS URLs no longer exist.
    if (/^\/(admin|api)(\/|$)/.test(pathname)) return send(res, 301, { Location: '/' }, '')

    const found = await resolveFile(pathname)
    if (!found) return notFound(req, res)
    if (found.dir) {
      if (!pathname.endsWith('/')) return send(res, 301, { Location: `${url.pathname}/${url.search}` }, '')
      if (!fs.existsSync(found.file)) return notFound(req, res)
    }
    return serveFile(req, res, found.file)
  } catch (err) {
    console.error('[server]', err)
    if (!res.headersSent) send(res, 500, { 'Content-Type': 'text/plain' }, 'Server error')
    else res.destroy()
  }
})

server.listen(PORT, () => console.log(`[server] FinOracles site running on port ${PORT}`))
