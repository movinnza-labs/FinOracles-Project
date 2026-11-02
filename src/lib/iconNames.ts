/**
 * Icon keys available to editors in the CMS. Kept free of React imports so the
 * Payload config can load it; the matching components live in components/ui/Icon.tsx.
 */
export const iconNames = [
  'award',
  'badge-check',
  'briefcase',
  'calculator',
  'car',
  'chart-column',
  'chart-line',
  'chart-pie',
  'circle-check',
  'circle-play',
  'clipboard-list',
  'clock',
  'compass',
  'file-text',
  'graduation-cap',
  'hand-coins',
  'heart-handshake',
  'heart-pulse',
  'house',
  'images',
  'info',
  'landmark',
  'layout-dashboard',
  'life-buoy',
  'lightbulb',
  'lock',
  'mail',
  'map-pin',
  'newspaper',
  'phone',
  'piggy-bank',
  'plane',
  'refresh-cw',
  'shield-check',
  'smartphone',
  'sprout',
  'target',
  'trending-up',
  'trophy',
  'umbrella',
  'users',
  'wallet',
] as const

export type IconName = (typeof iconNames)[number]

export const iconOptions = iconNames.map((value) => ({
  label: value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' '),
  value,
}))
