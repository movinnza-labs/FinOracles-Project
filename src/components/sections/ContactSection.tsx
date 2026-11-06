import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import type { SiteSetting } from '@/types/content'
import { EnquiryForm } from '@/components/forms/EnquiryForm'
import { SectionHead } from '@/components/ui/SectionHead'
import { SocialIcon, socialLabels } from '@/components/ui/SocialIcon'
import { getProducts } from '@/lib/queries'
import { telHref } from '@/lib/text'
import styles from './ContactSection.module.css'

type ContactSectionProps = {
  settings: SiteSetting
  heading?: string | null
  lead?: string | null
  formHeading?: string | null
  showDetails?: boolean
  /** Embed a Google Map of the office below the contact details. */
  showMap?: boolean
  defaultInterest?: string
  defaultMessage?: string
  /** See EnquiryForm: pre-fill interest/message from ?interest= and ?goal=. */
  goalMessages?: Record<string, string>
  id?: string
  /** Use h1 when this section is the main content of the page (e.g. /contact). */
  headingLevel?: 'h1' | 'h2'
}

export async function ContactSection({
  settings,
  heading,
  lead,
  formHeading,
  showDetails = true,
  showMap = false,
  defaultInterest,
  defaultMessage,
  goalMessages,
  id = 'contact',
  headingLevel = 'h2',
}: ContactSectionProps) {
  const address = settings.address
  const products = await getProducts()
  const interestOptions = products.map((p) => p.enquiryLabel || p.name)
  const mapQuery = address?.full || [address?.street, address?.locality, address?.postalCode].filter(Boolean).join(', ')

  return (
    <section id={id} className="section" aria-labelledby={`${id}-title`}>
      <div className={`container ${showDetails ? 'two-col' : 'container--narrow'}`}>
        {showDetails ? (
          <div>
            <SectionHead id={`${id}-title`} heading={heading} lead={lead} as={headingLevel} />
            <dl className={styles.list}>
              {address?.full && (
                <div>
                  <dt>
                    <MapPin aria-hidden /> Visit Us
                  </dt>
                  <dd>
                    {address.mapUrl ? (
                      <a href={address.mapUrl} target="_blank" rel="noopener noreferrer">
                        {address.full}
                        <span className="sr-only"> (opens map in a new tab)</span>
                      </a>
                    ) : (
                      address.full
                    )}
                  </dd>
                </div>
              )}
              {!!settings.phones?.length && (
                <div>
                  <dt>
                    <Phone aria-hidden /> Call Us
                  </dt>
                  <dd>
                    {settings.phones.map((p) => (
                      <a key={p.id ?? p.number} href={telHref(p.number)}>
                        {p.display}
                      </a>
                    ))}
                  </dd>
                </div>
              )}
              {!!settings.emails?.length && (
                <div>
                  <dt>
                    <Mail aria-hidden /> Email Us
                  </dt>
                  <dd>
                    {settings.emails.map((e) => (
                      <a key={e.id ?? e.email} href={`mailto:${e.email}`}>
                        {e.email}
                      </a>
                    ))}
                  </dd>
                </div>
              )}
              {settings.businessHours && (
                <div>
                  <dt>
                    <Clock aria-hidden /> Business Hours
                  </dt>
                  <dd>{settings.businessHours}</dd>
                </div>
              )}
            </dl>

            {!!settings.socials?.length && (
              <>
                <h3 className={styles.followHeading}>Follow Us</h3>
                <ul role="list" className={styles.socials}>
                  {settings.socials.map((s) => (
                    <li key={s.id ?? s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        <SocialIcon platform={s.platform} />
                        <span className="sr-only">{socialLabels[s.platform]} (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {showMap && mapQuery && (
              <div className={styles.map}>
                <iframe
                  title={`Map showing ${settings.legalName}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        ) : (
          <SectionHead id={`${id}-title`} heading={heading} lead={lead} center as={headingLevel} />
        )}
        <div className="reveal">
          <EnquiryForm
            heading={formHeading}
            interestOptions={interestOptions}
            defaultInterest={defaultInterest}
            defaultMessage={defaultMessage}
            goalMessages={goalMessages}
            submitLabel="Send Message"
          />
        </div>
      </div>
    </section>
  )
}
