'use server'

import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/queries'

export type EnquiryState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  errors?: Partial<Record<'name' | 'email' | 'subject' | 'message', string>>
  values?: Partial<Record<'name' | 'email' | 'subject' | 'message', string>>
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Light in-memory throttle per client IP (per server instance).
const recent = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5

const throttled = (key: string) => {
  const now = Date.now()
  const hits = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  hits.push(now)
  recent.set(key, hits)
  return hits.length > MAX_PER_WINDOW
}

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const field = (name: string) => String(formData.get(name) ?? '').trim()
  const values = {
    name: field('name').slice(0, 120),
    email: field('email').slice(0, 200),
    subject: field('subject').slice(0, 200),
    message: field('message').slice(0, 5000),
  }

  // Honeypot: real visitors never see or fill this field.
  if (field('website')) return { status: 'success', message: 'Thank you! We will get back to you shortly.' }

  const errors: EnquiryState['errors'] = {}
  if (values.name.length < 2) errors.name = 'Please enter your name.'
  if (!EMAIL_RE.test(values.email)) errors.email = 'Please enter a valid email address.'
  if (values.subject.length < 2) errors.subject = 'Please add a subject.'
  if (values.message.length < 10) errors.message = 'Please write a short message (at least 10 characters).'
  if (Object.keys(errors).length) {
    return { status: 'error', message: 'Please correct the highlighted fields.', errors, values }
  }

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  if (throttled(ip)) {
    return { status: 'error', message: 'Too many messages sent. Please try again in a few minutes.', values }
  }

  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'enquiries',
      data: { ...values, page: field('page').slice(0, 300), status: 'new' },
    })
    return { status: 'success', message: 'Thank you! Your message has been sent. Our team will get back to you shortly.' }
  } catch (err) {
    console.error('[enquiry] failed to save', err)
    return {
      status: 'error',
      message: 'Sorry, something went wrong. Please call or email us instead.',
      values,
    }
  }
}
