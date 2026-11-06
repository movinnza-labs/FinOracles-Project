'use server'

import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/queries'

type Field = 'name' | 'phone' | 'email' | 'interest' | 'callbackTime' | 'message' | 'consent'

export type EnquiryState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  errors?: Partial<Record<Field, string>>
  values?: Partial<Record<Exclude<Field, 'consent'>, string>>
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Light in-memory throttle per client IP (per server instance).
const recent = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5

const MAX_KEYS = 5000

const throttled = (key: string) => {
  const now = Date.now()
  // Drop expired entries so the map can't grow without bound.
  if (recent.size > MAX_KEYS) {
    for (const [k, times] of recent) {
      if (now - times[times.length - 1] >= WINDOW_MS) recent.delete(k)
    }
    if (recent.size > MAX_KEYS) recent.clear()
  }
  const hits = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  hits.push(now)
  recent.set(key, hits)
  return hits.length > MAX_PER_WINDOW
}

/** Accepts Indian numbers with or without +91/0 prefix and spaces/dashes. */
const validPhone = (value: string) => {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 13
}

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const field = (name: string) => String(formData.get(name) ?? '').trim()
  const values = {
    name: field('name').slice(0, 120),
    phone: field('phone').slice(0, 20),
    email: field('email').slice(0, 200),
    interest: field('interest').slice(0, 120),
    callbackTime: field('callbackTime').slice(0, 60),
    message: field('message').slice(0, 5000),
  }
  const consent = formData.get('consent') === 'on'

  // Honeypot: real visitors never see or fill this field.
  if (field('website')) return { status: 'success', message: 'Thank you! We will call you back shortly.' }

  const errors: EnquiryState['errors'] = {}
  if (values.name.length < 2) errors.name = 'Please enter your name.'
  if (!validPhone(values.phone)) errors.phone = 'Please enter a valid mobile number.'
  if (values.email && !EMAIL_RE.test(values.email)) errors.email = 'Please enter a valid email address.'
  if (!consent) errors.consent = 'Please agree so we can contact you.'
  if (Object.keys(errors).length) {
    return { status: 'error', message: 'Please correct the highlighted fields.', errors, values }
  }

  const h = await headers()
  // The proxy (Nginx) puts the real client IP last; earlier entries can be set by the client.
  const ip = h.get('x-forwarded-for')?.split(',').at(-1)?.trim() || h.get('x-real-ip') || 'unknown'
  if (throttled(ip)) {
    return { status: 'error', message: 'Too many requests. Please try again in a few minutes, or call us.', values }
  }

  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'enquiries',
      data: {
        ...values,
        email: values.email || undefined,
        consent: true,
        page: field('page').slice(0, 300),
        status: 'new',
      },
    })
    return {
      status: 'success',
      message: 'Thank you! Your request has been received. Our team will call you back shortly.',
    }
  } catch (err) {
    console.error('[enquiry] failed to save', err)
    return {
      status: 'error',
      message: 'Sorry, something went wrong. Please call or WhatsApp us instead.',
      values,
    }
  }
}
