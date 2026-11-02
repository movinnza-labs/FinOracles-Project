import { Info } from 'lucide-react'
import { SocialIcon } from '@/components/ui/SocialIcon'
import styles from './SiteExtras.module.css'

export function Disclaimer({ text }: { text?: string | null }) {
  if (!text) return null
  return (
    <p className={styles.disclaimer}>
      <span className="container">
        <Info aria-hidden />
        {text}
      </span>
    </p>
  )
}

export function WhatsAppButton({ number, message, siteName }: { number?: string | null; message?: string | null; siteName: string }) {
  if (!number) return null
  const href = `https://wa.me/${number.replace(/\D/g, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.whatsapp}>
      <SocialIcon platform="whatsapp" size={28} />
      <span className="sr-only">Chat with {siteName} on WhatsApp (opens in a new tab)</span>
    </a>
  )
}
