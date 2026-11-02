'use client'

import { usePathname } from 'next/navigation'
import { useActionState } from 'react'
import { CircleAlert, CircleCheck, Send } from 'lucide-react'
import { submitEnquiry, type EnquiryState } from '@/lib/actions/enquiry'
import styles from './EnquiryForm.module.css'

const initial: EnquiryState = { status: 'idle' }

const fields = [
  { name: 'name', label: 'Your Name', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'Your Email', type: 'email', autoComplete: 'email' },
  { name: 'subject', label: 'Subject', type: 'text' },
] as const

export function EnquiryForm({ heading = 'Send us a Message' }: { heading?: string | null }) {
  // React resets action forms after submit; failed submissions restore values via defaultValue.
  const [state, action, pending] = useActionState(submitEnquiry, initial)
  const pathname = usePathname()

  const errorProps = (name: keyof NonNullable<EnquiryState['errors']>) => {
    const error = state.errors?.[name]
    return error ? { 'aria-invalid': true, 'aria-describedby': `enquiry-${name}-error` } : {}
  }

  return (
    <form action={action} className={styles.form} noValidate>
      {heading && <h3 className={styles.heading}>{heading}</h3>}

      {fields.map((f) => (
        <div key={f.name} className={styles.field}>
          <label htmlFor={`enquiry-${f.name}`}>{f.label}</label>
          <input
            id={`enquiry-${f.name}`}
            name={f.name}
            type={f.type}
            required
            autoComplete={'autoComplete' in f ? f.autoComplete : undefined}
            defaultValue={state.status === 'error' ? state.values?.[f.name] : undefined}
            className={styles.input}
            {...errorProps(f.name)}
          />
          {state.errors?.[f.name] && (
            <p id={`enquiry-${f.name}-error`} className={styles.fieldError}>
              {state.errors[f.name]}
            </p>
          )}
        </div>
      ))}

      <div className={styles.field}>
        <label htmlFor="enquiry-message">Your Message</label>
        <textarea
          id="enquiry-message"
          name="message"
          rows={4}
          required
          defaultValue={state.status === 'error' ? state.values?.message : undefined}
          className={styles.input}
          {...errorProps('message')}
        />
        {state.errors?.message && (
          <p id="enquiry-message-error" className={styles.fieldError}>
            {state.errors.message}
          </p>
        )}
      </div>

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
        {pending ? 'Sending…' : 'Send Message'}
        <Send aria-hidden />
      </button>
    </form>
  )
}
