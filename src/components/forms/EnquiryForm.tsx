'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CircleAlert, CircleCheck, Send } from 'lucide-react'
import styles from './EnquiryForm.module.css'

type Field = 'name' | 'phone' | 'email' | 'interest' | 'callbackTime' | 'message' | 'consent'

export type EnquiryState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  errors?: Partial<Record<Field, string>>
}

const initial: EnquiryState = { status: 'idle' }

/** PHP mail handler served next to the static site (public/contact.php). */
const ENDPOINT = '/contact.php'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const FALLBACK_ERROR = 'Sorry, something went wrong. Please call or WhatsApp us instead.'

/** Same rules as contact.php, so most mistakes are shown without a round trip. */
const validate = (form: FormData): EnquiryState['errors'] => {
  const v = (name: string) => String(form.get(name) ?? '').trim()
  const errors: EnquiryState['errors'] = {}
  if (v('name').length < 2) errors.name = 'Please enter your name.'
  const digits = v('phone').replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 13) errors.phone = 'Please enter a valid mobile number.'
  if (v('email') && !EMAIL_RE.test(v('email'))) errors.email = 'Please enter a valid email address.'
  if (form.get('consent') !== 'on') errors.consent = 'Please agree so we can contact you.'
  return errors
}

export const GENERAL_INTEREST = 'General enquiry'
const callbackTimes = ['Any time', 'Morning (9 AM – 12 PM)', 'Afternoon (12 PM – 4 PM)', 'Evening (4 PM – 7 PM)']

type EnquiryFormProps = {
  heading?: string | null
  /** Product names offered in the "Interested in" list. */
  interestOptions?: string[]
  defaultInterest?: string
  defaultMessage?: string
  submitLabel?: string
  /**
   * Pre-fill from the page URL: ?interest=<product name> selects the product and
   * ?goal=<key> puts goalMessages[key] in the message box (used on /contact).
   */
  goalMessages?: Record<string, string>
}

type ErrorKey = keyof NonNullable<EnquiryState['errors']>

export function EnquiryForm({
  heading = 'Request a Call Back',
  interestOptions = [],
  defaultInterest,
  defaultMessage,
  submitLabel = 'Request a Call Back',
  goalMessages,
}: EnquiryFormProps) {
  const [state, setState] = useState<EnquiryState>(initial)
  const [pending, setPending] = useState(false)
  const interestRef = useRef<HTMLSelectElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)

  // Static pages can't read the query string at build time, so apply it in the browser.
  useEffect(() => {
    if (!goalMessages) return
    const params = new URLSearchParams(window.location.search)
    const interest = params.get('interest')
    const goal = params.get('goal')
    const select = interestRef.current
    if (interest && select && [...select.options].some((o) => o.value === interest)) select.value = interest
    if (goal && goalMessages[goal] && messageRef.current && !messageRef.current.value) {
      messageRef.current.value = goalMessages[goal]
    }
  }, [goalMessages])

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const errors = validate(data)
    if (errors && Object.keys(errors).length) {
      setState({ status: 'error', message: 'Please correct the highlighted fields.', errors })
      return
    }
    setPending(true)
    try {
      const res = await fetch(ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      const json = (await res.json().catch(() => null)) as EnquiryState | null
      if (res.ok && json?.status === 'success') {
        form.reset()
        setState({ status: 'success', message: json.message })
      } else {
        setState({ status: 'error', message: json?.message || FALLBACK_ERROR, errors: json?.errors })
      }
    } catch {
      setState({ status: 'error', message: FALLBACK_ERROR })
    } finally {
      setPending(false)
    }
  }

  const pathname = usePathname()
  const options = [GENERAL_INTEREST, ...interestOptions.filter((o) => o !== GENERAL_INTEREST)]

  const errorProps = (name: ErrorKey) =>
    state.errors?.[name] ? { 'aria-invalid': true, 'aria-describedby': `enquiry-${name}-error` } : {}

  const fieldError = (name: ErrorKey) =>
    state.errors?.[name] ? (
      <p id={`enquiry-${name}-error`} className={styles.fieldError}>
        {state.errors[name]}
      </p>
    ) : null

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      {heading && <h3 className={styles.heading}>{heading}</h3>}

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="enquiry-name">
            Your Name <span aria-hidden>*</span>
          </label>
          <input
            id="enquiry-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={styles.input}
            {...errorProps('name')}
          />
          {fieldError('name')}
        </div>
        <div className={styles.field}>
          <label htmlFor="enquiry-phone">
            Mobile Number <span aria-hidden>*</span>
          </label>
          <input
            id="enquiry-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            placeholder="+91"
            className={styles.input}
            {...errorProps('phone')}
          />
          {fieldError('phone')}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="enquiry-email">
          Email <span className={styles.optional}>(optional)</span>
        </label>
        <input
          id="enquiry-email"
          name="email"
          type="email"
          autoComplete="email"
          className={styles.input}
          {...errorProps('email')}
        />
        {fieldError('email')}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="enquiry-interest">Interested in</label>
          <select
            id="enquiry-interest"
            ref={interestRef}
            name="interest"
            defaultValue={defaultInterest ?? GENERAL_INTEREST}
            className={styles.input}
          >
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="enquiry-callbackTime">Best time to call</label>
          <select
            id="enquiry-callbackTime"
            name="callbackTime"
            defaultValue={callbackTimes[0]}
            className={styles.input}
          >
            {callbackTimes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="enquiry-message">
          Message <span className={styles.optional}>(optional)</span>
        </label>
        <textarea
          id="enquiry-message"
          ref={messageRef}
          name="message"
          rows={3}
          defaultValue={defaultMessage}
          className={styles.input}
        />
      </div>

      <div className={styles.consent}>
        <input
          id="enquiry-consent"
          name="consent"
          type="checkbox"
          required
          {...errorProps('consent')}
        />
        <label htmlFor="enquiry-consent">
          I agree to be contacted by FinOracles by phone, WhatsApp or email about my enquiry, and accept the{' '}
          <Link href="/privacy-policy">Privacy Policy</Link>.
        </label>
      </div>
      {fieldError('consent')}

      {/* Spam honeypot — hidden from people, filled by bots */}
      <div className={styles.trap} aria-hidden>
        <label htmlFor="enquiry-website">Website</label>
        <input id="enquiry-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="page" value={pathname} />

      <div aria-live="polite" className={styles.status}>
        {state.status === 'success' && (
          <p className={styles.success}>
            <CircleCheck aria-hidden /> {state.message}
          </p>
        )}
        {state.status === 'error' && state.message && (
          <p className={styles.error}>
            <CircleAlert aria-hidden /> {state.message}
          </p>
        )}
      </div>

      <button type="submit" className={styles.submit} disabled={pending}>
        {pending ? 'Sending…' : submitLabel}
        <Send aria-hidden />
      </button>
    </form>
  )
}
