import type { Media } from '@/payload-types'
import { getServerURL } from './url'

export type ImageData = {
  src: string
  alt: string
  width: number
  height: number
}

type SizeName = keyof NonNullable<Media['sizes']>

/**
 * Payload returns upload URLs prefixed with serverURL. next/image only optimises
 * same-origin files given as relative paths (images.localPatterns), so strip it;
 * bucket (S3) URLs on another origin stay absolute and use remotePatterns.
 */
const toSrc = (url: string) => {
  const origin = getServerURL()
  return url.startsWith(`${origin}/`) ? url.slice(origin.length) : url
}

/**
 * Normalises an upload field value (populated Media doc, bare ID, or null) into
 * props for next/image. Returns null when the image is not populated.
 */
export const getImage = (value: unknown, size?: SizeName): ImageData | null => {
  if (!value || typeof value !== 'object') return null
  const media = value as Media
  const variant = size ? media.sizes?.[size] : undefined
  const src = variant?.url || media.url
  if (!src) return null
  return {
    src: toSrc(src),
    alt: media.alt ?? '',
    width: (variant?.url ? variant.width : media.width) || 1200,
    height: (variant?.url ? variant.height : media.height) || 800,
  }
}
