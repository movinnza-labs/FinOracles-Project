import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import type { SiteSetting } from '@/payload-types'
import { EnquiryForm } from '@/components/forms/EnquiryForm'
import { SectionHead } from '@/components/ui/SectionHead'
import { SocialIcon, socialLabels } from '@/components/ui/SocialIcon'
import { telHref } from '@/lib/text'
import styles from './ContactSection.module.css'

type ContactSectionProps = {
  settings: SiteSetting
  heading?: string | null
  lead?: string | null
  formHeading?: string | null
  showDetails?: boolean
  id?: string
}

export function ContactSection({
  settings,
  heading,
  lead,
  formHeading,
  showDetails = true,
  id = 'contact',
}: ContactSectionProps) {
  const address = settings.address
  return (
    <section id={id} className="section" aria-labelledby={`${id}-title`}>
      <div className={`container ${showDetails ? 'two-col' : 'container--narrow'}`}>
        {showDetails ? (
          <div>
            <SectionHead id={`${id}-title`} heading={heading} lead={lead} />
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
          </div>
        ) : (
          <SectionHead id={`${id}-title`} heading={heading} lead={lead} center />
        )}
        <div className="reveal">
          <EnquiryForm heading={formHeading} />
        </div>
      </div>
    </section>
  )
}
