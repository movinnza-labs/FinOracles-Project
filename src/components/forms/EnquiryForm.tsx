'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useActionState } from 'react'
import { CircleAlert, CircleCheck, Send } from 'lucide-react'
import { submitEnquiry, type EnquiryState } from '@/lib/actions/enquiry'
import styles from './EnquiryForm.module.css'

const initial: EnquiryState = { status: 'idle' }

export const GENERAL_INTEREST = 'General enquiry'
const callbackTimes = ['Any time', 'Morning (9 AM – 12 PM)', 'Afternoon (12 PM – 4 PM)', 'Evening (4 PM – 7 PM)']

type EnquiryFormProps = {
  heading?: string | null
  /** Product names offered in the "Interested in" list. */
  interestOptions?: string[]
  defaultInterest?: string
  defaultMessage?: string
  submitLabel?: string
}

type ErrorKey = keyof NonNullable<EnquiryState['errors']>

export function EnquiryForm({
  heading = 'Request a Call Back',
  interestOptions = [],
  defaultInterest,
  defaultMessage,
  submitLabel = 'Request a Call Back',
}: EnquiryFormProps) {
  // React resets action forms after submit; failed submissions restore values via defaultValue.
  const [state, action, pending] = useActionState(submitEnquiry, initial)
  const pathname = usePathname()
  const failed = state.status === 'error'
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
    <form action={action} className={styles.form} noValidate>
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
            defaultValue={failed ? state.values?.name : undefined}
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
            defaultValue={failed ? state.values?.phone : undefined}
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
          defaultValue={failed ? state.values?.email : undefined}
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
            name="interest"
            defaultValue={(failed ? state.values?.interest : undefined) ?? defaultInterest ?? GENERAL_INTEREST}
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
            defaultValue={(failed ? state.values?.callbackTime : undefined) ?? callbackTimes[0]}
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
          name="message"
          rows={3}
          defaultValue={(failed ? state.values?.message : undefined) ?? defaultMessage}
          className={styles.input}
        />
      </div>

      <div className={styles.consent}>
        <input
          id="enquiry-consent"
          name="consent"
          type="checkbox"
          required
          defaultChecked={failed && !state.errors?.consent}
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
