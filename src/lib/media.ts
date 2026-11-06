import type { Media } from '@/types/content'

export type ImageData = {
  src: string
  alt: string
  width: number
  height: number
}

type SizeName = keyof NonNullable<Media['sizes']>

/**
 * Normalises an image field value (Media object or null) into
 * props for next/image. Returns null when the image is not populated.
 */
export const getImage = (value: unknown, size?: SizeName): ImageData | null => {
  if (!value || typeof value !== 'object') return null
  const media = value as Media
  const variant = size ? media.sizes?.[size] : undefined
  const src = variant?.url || media.url
  if (!src) return null
  return {
    src,
    alt: media.alt ?? '',
    width: (variant?.url ? variant.width : media.width) || 1200,
    height: (variant?.url ? variant.height : media.height) || 800,
  }
}
