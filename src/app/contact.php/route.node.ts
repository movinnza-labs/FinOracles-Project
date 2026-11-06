/**
 * Contact / call-back form handler when the site runs as a Node.js app
 * (Hostinger Web App: `npm run build` + `npm start`).
 *
 * The URL is /contact.php so the same form works in both hosting modes: in the
 * static upload (npm run package) Apache runs hosting/contact.php instead, and this
 * file is left out of the build (see pageExtensions in next.config.ts).
 *
 * Environment (hPanel → Web App → Environment variables):
 *   SMTP_HOST=smtp.hostinger.com  SMTP_PORT=465  SMTP_USER=no-reply@finoracles.com  SMTP_PASS=...
 *   ENQUIRY_NOTIFY_TO=connect@finoracles.com
 *   ENQUIRY_DIR=/path/for/csv  (optional; default ../finoracles-enquiries)
 */
import { appendFile, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import nodemailer, { type Transporter } from 'nodemailer'

export const dynamic = 'force-dynamic'

const NOTIFY_TO = process.env.ENQUIRY_NOTIFY_TO || 'connect@finoracles.com'
const ENQUIRY_DIR = process.env.ENQUIRY_DIR || path.join(process.cwd(), '..', 'finoracles-enquiries')
const MAX_BODY = 64 * 1024
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const SUCCESS = { status: 'success', message: 'Thank you! Your request has been received. Our team will call you back shortly.' }
const FAILURE = { status: 'error', message: 'Sorry, something went wrong. Please call or WhatsApp us instead.' }

const reply = (body: object, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

// Light in-memory throttle per client IP.
const hits = new Map<string, number[]>()
const throttled = (ip: string) => {
  const now = Date.now()
  if (hits.size > 5000) hits.clear()
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000)
  list.push(now)
  hits.set(ip, list)
  return list.length > 5
}

let transporter: Transporter | null = null
const getTransporter = () => {
  if (!process.env.SMTP_HOST) return null
  if (!transporter) {
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

const csvCell = (v: string) => {
  const s = /^[=+\-@]/.test(v) ? `'${v}` : v
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET() {
  return reply({ status: 'error', message: 'Method not allowed.' }, 405)
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin')
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  if (origin && host && new URL(origin).host !== host) return reply({ status: 'error', message: 'Request not allowed.' }, 403)
  if (Number(req.headers.get('content-length') || 0) > MAX_BODY) return reply(FAILURE, 413)

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return reply(FAILURE, 400)
  }

  const field = (name: string, max: number) =>
    String(form.get(name) ?? '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .trim()
      .slice(0, max)
  const line = (v: string) => v.replace(/[\r\n]+/g, ' ')
  const v = {
    name: line(field('name', 120)),
    phone: line(field('phone', 20)),
    email: line(field('email', 200)),
    interest: line(field('interest', 120)),
    callbackTime: line(field('callbackTime', 60)),
    message: field('message', 5000),
    page: line(field('page', 300)),
  }

  if (field('website', 200)) return reply(SUCCESS) // honeypot

  const errors: Record<string, string> = {}
  if (v.name.length < 2) errors.name = 'Please enter your name.'
  const digits = v.phone.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 13) errors.phone = 'Please enter a valid mobile number.'
  if (v.email && !EMAIL_RE.test(v.email)) errors.email = 'Please enter a valid email address.'
  if (form.get('consent') !== 'on') errors.consent = 'Please agree so we can contact you.'
  if (Object.keys(errors).length) {
    return reply({ status: 'error', message: 'Please correct the highlighted fields.', errors }, 422)
  }

  // The proxy appends the real client IP last; earlier entries can be set by the client.
  const ip = req.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() || req.headers.get('x-real-ip') || 'unknown'
  if (throttled(ip)) {
    return reply({ status: 'error', message: 'Too many requests. Please try again in a few minutes, or call us.' }, 429)
  }

  const date = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })
  let saved = false
  let mailed = false

  try {
    await mkdir(ENQUIRY_DIR, { recursive: true })
    const csv = path.join(ENQUIRY_DIR, 'enquiries.csv')
    const exists = await stat(csv).then(() => true, () => false)
    const header = exists ? '' : 'Date (IST),Name,Phone,Email,Interested in,Best time to call,Message,Page,IP\n'
    const row = [date, v.name, v.phone, v.email, v.interest, v.callbackTime, v.message, v.page, ip].map(csvCell).join(',')
    await appendFile(csv, `${header}${row}\n`)
    saved = true
  } catch (err) {
    console.error('[enquiry] could not save CSV', err)
  }

  const mailer = getTransporter()
  if (mailer) {
    try {
      await mailer.sendMail({
        from: { name: 'FinOracles Website', address: process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@finoracles.com' },
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
    } catch (err) {
      console.error('[enquiry] could not send email', err)
    }
  } else {
    console.warn('[enquiry] SMTP_HOST is not set; enquiry saved to CSV only')
  }

  return saved || mailed ? reply(SUCCESS) : reply(FAILURE, 500)
}
